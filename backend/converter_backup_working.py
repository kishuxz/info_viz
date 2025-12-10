# backend/converter.py

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

import os
import re
import json
from collections import Counter

import pandas as pd

# ------------------ app setup ------------------

app = Flask(__name__)

# CORS configuration for development - allow all origins
CORS(app, 
     resources={r"/*": {
         "origins": "*",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": False
     }}
)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

ALLOWED_EXT = {".csv", ".xlsx"}


# ------------------ small helpers ------------------

def _allowed(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in ALLOWED_EXT


def _unique_path(folder: str, filename: str) -> str:
    base, ext = os.path.splitext(filename)
    p = os.path.join(folder, filename)
    i = 1
    while os.path.exists(p):
        p = os.path.join(folder, f"{base}_{i}{ext}")
        i += 1
    return p


def norm_str(s: str) -> str:
    """Trim + collapse whitespace."""
    s = str(s) if s is not None else ""
    s = s.strip()
    s = re.sub(r"\s+", " ", s)
    return s


def canonical_key(s: str) -> str:
    """
    Canonical key for deduping (orgs, events).
    Lowercase, strip punctuation & extra spaces.
    """
    s = norm_str(s).lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def slug(s: str) -> str:
    s = canonical_key(s)
    s = s.replace(" ", "_")
    return s or "unknown"


def pretty_name(s: str) -> str:
    """
    Make labels look nice:
    - if ALL CAPS → title case
    - otherwise keep as-is except trimming
    """
    s = norm_str(s)
    if not s:
        return ""
    if s.isupper():
        return s.lower().title()
    return s


def first_non_empty(vals):
    for v in vals:
        v = norm_str(v)
        if v:
            return v
    return ""


def most_common_non_empty(vals):
    vals = [norm_str(v) for v in vals if norm_str(v)]
    return Counter(vals).most_common(1)[0][0] if vals else ""


# ------------------ reading & merging many files ------------------

def read_one(path: str) -> pd.DataFrame:
    ext = os.path.splitext(path)[1].lower()
    if ext == ".csv":
        df = pd.read_csv(path)
    elif ext == ".xlsx":
        df = pd.read_excel(path)
    else:
        raise RuntimeError(f"Unsupported file type: {ext} (only .csv, .xlsx)")

    df = df.rename(columns=lambda c: str(c).strip())
    df.fillna("", inplace=True)
    df["__source_file__"] = os.path.basename(path)
    return df


def merge_files(paths):
    frames = []
    for p in paths:
        if not _allowed(p):
            raise RuntimeError(f"Unsupported extension for '{p}'. Allowed: {sorted(ALLOWED_EXT)}")
        if not os.path.exists(p):
            raise RuntimeError(f"File not found: {p}")
        frames.append(read_one(p))

    if not frames:
        raise RuntimeError("No readable files given.")

    # union of columns
    all_cols = set()
    for f in frames:
        all_cols |= set(f.columns)
    frames = [f.reindex(columns=sorted(all_cols)).fillna("") for f in frames]

    big = pd.concat(frames, ignore_index=True)
    return big


# ------------------ graph builder ------------------

def build_graph_from_responses(df: pd.DataFrame, mapping=None):
    """
    df is the merged DataFrame from one or many event CSVs.

    Expected (case-insensitive) columns:

      orgName, sector, firstName, lastName, email, socialLink, phone,
      addressStreet, addressCity, addressState, addressCountry,
      Role, eventId, eventName, eventDate, connections

    mapping: optional dict mapping logical names to actual CSV column names
      Example: {"orgName": "Organization", "eventId": "Conference ID"}

    We will:
      - normalize org & event names (case, spaces)
      - dedupe orgs across all files
      - produce:
          nodes_df (events + orgs)
          edges_df (attendance org→event + connection org→org)
    """

    mapping = mapping or {}
    # map lowercase -> actual name
    cols_lower = {c.lower(): c for c in df.columns}

    def col(name, required=False):
        # 1) Check if user provided a mapping for this logical name
        user_col = mapping.get(name)
        if user_col and user_col in df.columns:
            return df[user_col].astype(str)
        
        # 2) Fallback to old behavior (canonical name matching)
        key = name.lower()
        if key in cols_lower:
            return df[cols_lower[key]].astype(str)
        if required:
            raise RuntimeError(
                f"Required column '{name}' not found. "
                f"Available columns: {list(df.columns)}"
            )
        return pd.Series([""] * len(df))

    org_name   = col("orgname",   required=True)
    sector     = col("sector")
    city       = col("addresscity")
    state      = col("addressstate")
    country    = col("addresscountry")

    event_id   = col("eventid",   required=True)
    event_name = col("eventname", required=True)
    event_date = col("eventdate", required=True)

    # optional connections column
    connections_colname = cols_lower.get("connections")

    # Canonical keys
    org_key   = org_name.apply(canonical_key)
    event_key = pd.Series(
        [
            canonical_key(eid) or canonical_key(ename)
            for eid, ename in zip(event_id, event_name)
        ]
    )

    # ---------- EVENT NODES ----------
    event_rows = []
    for key, group in df.groupby(event_key):
        if not key:
            continue
        any_eid   = first_non_empty(group[cols_lower["eventid"]])
        any_name  = first_non_empty(group[cols_lower["eventname"]])
        any_date  = first_non_empty(group[cols_lower["eventdate"]])
        any_city  = first_non_empty(group[cols_lower.get("addresscity", "")]) if "addresscity" in cols_lower else ""
        any_state = first_non_empty(group[cols_lower.get("addressstate", "")]) if "addressstate" in cols_lower else ""
        any_country = first_non_empty(group[cols_lower.get("addresscountry", "")]) if "addresscountry" in cols_lower else ""

        node_id = f"evt_{slug(key)}"
        label   = pretty_name(any_name or any_eid)
        event_rows.append(
            (
                node_id, label, "event",
                "", "",                       # org_type, org_sector (blank)
                any_city, any_state, any_country,
                any_date, any_eid
            )
        )

    event_df = pd.DataFrame(
        event_rows,
        columns=[
            "Id", "Label", "type",
            "org_type", "org_sector",
            "city", "state", "country",
            "event_date", "event_id",
        ],
    )

    # ---------- ORG NODES ----------
    org_rows = []
    
    # Get extra attributes from mapping if provided
    extra_attrs = mapping.get("extraAttrs", []) if mapping else []

    for key, group in df.groupby(org_key):
        if not key:
            continue
        labels  = group[cols_lower["orgname"]]
        sectors = group[cols_lower.get("sector", "")] if "sector" in cols_lower else ""
        cities  = group[cols_lower.get("addresscity", "")] if "addresscity" in cols_lower else ""
        states  = group[cols_lower.get("addressstate", "")] if "addressstate" in cols_lower else ""
        countries = group[cols_lower.get("addresscountry", "")] if "addresscountry" in cols_lower else ""

        label   = pretty_name(most_common_non_empty(labels) or key)
        sector_ = most_common_non_empty(sectors) if isinstance(sectors, pd.Series) else ""
        city_   = most_common_non_empty(cities) if isinstance(cities, pd.Series) else ""
        state_  = most_common_non_empty(states) if isinstance(states, pd.Series) else ""
        country_ = most_common_non_empty(countries) if isinstance(countries, pd.Series) else ""

        node_id = f"org_{slug(key)}"
        
        # Build base row data
        row_data = [
            node_id, label, "org",
            "", sector_,
            city_, state_, country_,
            "", ""      # event_date, event_id
        ]
        
        # Add extra attributes
        for attr in extra_attrs:
            if attr in df.columns:
                attr_values = group[attr]
                row_data.append(most_common_non_empty(attr_values) if len(attr_values) > 0 else "")
            else:
                row_data.append("")
        
        org_rows.append(tuple(row_data))

    # ---------- ATTENDANCE EDGES (org -> event) ----------
    att_edges = []
    for ok, ek, eid, ename, edate in zip(
        org_key, event_key, event_id, event_name, event_date
    ):
        if not ok or not ek:
            continue
        org_id = f"org_{slug(ok)}"
        ev_id  = f"evt_{slug(ek)}"
        att_edges.append(
            {
                "Source": org_id,
                "Target": ev_id,
                "edge_type": "attendance",
                "event_id": norm_str(eid),
                "event_date": norm_str(edate),
                "connection_type": "",
                "description": "",
                "weight": 1,
            }
        )

    if att_edges:
        att_df = pd.DataFrame(att_edges)
        grouped = (
            att_df.groupby(
                ["Source", "Target", "edge_type", "event_id", "event_date"],
                dropna=False,
            )["weight"]
            .sum()
            .reset_index()
        )
        grouped["connection_type"] = ""
        grouped["description"] = ""
        attendance_df = grouped
    else:
        attendance_df = pd.DataFrame(
            columns=[
                "Source", "Target", "edge_type",
                "event_id", "event_date",
                "connection_type", "description",
                "weight",
            ]
        )

    # ---------- CONNECTION EDGES (org -> org) ----------
    conn_edges = []
    if connections_colname:
        for _, row in df.iterrows():
            base_ok = canonical_key(row.get(cols_lower["orgname"], ""))
            if not base_ok:
                continue
            base_id   = f"org_{slug(base_ok)}"
            eid_val   = norm_str(row.get(cols_lower["eventid"], ""))
            edate_val = norm_str(row.get(cols_lower["eventdate"], ""))
            raw       = norm_str(row.get(connections_colname, ""))

            if not raw or raw == "[]":
                continue

            # Try to parse JSON (stringified array)
            try:
                data = json.loads(raw)
            except Exception:
                try:
                    data = json.loads(json.loads(raw))
                except Exception:
                    continue

            if isinstance(data, dict):
                data = [data]
            if not isinstance(data, list):
                continue

            for conn in data:
                try:
                    org2 = (
                        conn.get("organization")
                        or conn.get("orgName")
                        or conn.get("connectionOrg")
                        or conn.get("connectionOrganization")
                        or conn.get("connection_organization")
                    )
                    if not org2:
                        continue
                    org2_label = pretty_name(org2)
                    ok2 = canonical_key(org2)
                    if not ok2:
                        continue
                    target_id = f"org_{slug(ok2)}"

                    ctype = conn.get("connectionType") or conn.get("type") or ""
                    desc  = conn.get("description")   or conn.get("notes") or ""

                    # ensure target org exists as a node (minimal info)
                    org_rows.append(
                        (
                            target_id,
                            org2_label,
                            "org",
                            "", "",
                            "", "", "",
                            "", ""
                        )
                    )

                    conn_edges.append(
                        {
                            "Source": base_id,
                            "Target": target_id,
                            "edge_type": "connection",
                            "event_id": eid_val,
                            "event_date": edate_val,
                            "connection_type": norm_str(ctype),
                            "description": norm_str(desc),
                            "weight": 1,
                        }
                    )
                except Exception:
                    continue

    if conn_edges:
        conn_df = pd.DataFrame(conn_edges)
        grouped = (
            conn_df.groupby(
                [
                    "Source", "Target", "edge_type",
                    "event_id", "event_date",
                    "connection_type", "description",
                ],
                dropna=False,
            )["weight"]
            .sum()
            .reset_index()
        )
        connection_df = grouped
    else:
        connection_df = pd.DataFrame(
            columns=[
                "Source", "Target", "edge_type",
                "event_id", "event_date",
                "connection_type", "description", "weight",
            ]
        )

    # ---------- FINAL NODES & EDGES ----------

    if org_rows:
        # Build column list dynamically
        base_columns = [
            "Id", "Label", "type",
            "org_type", "org_sector",
            "city", "state", "country",
            "event_date", "event_id",
        ]
        
        # Add extra attribute columns
        all_columns = base_columns + extra_attrs
        
        org_df = pd.DataFrame(
            org_rows,
            columns=all_columns,
        )
        
        # Build aggregation dict dynamically
        agg_dict = {
            "Label": first_non_empty,
            "type": "first",
            "org_type": first_non_empty,
            "org_sector": first_non_empty,
            "city": first_non_empty,
            "state": first_non_empty,
            "country": first_non_empty,
            "event_date": first_non_empty,
            "event_id": first_non_empty,
        }
        
        # Add extra attrs to aggregation
        for attr in extra_attrs:
            agg_dict[attr] = first_non_empty
        
        org_df = org_df.groupby("Id", as_index=False).agg(agg_dict)
    else:
        org_df = pd.DataFrame(
            columns=[
                "Id", "Label", "type",
                "org_type", "org_sector",
                "city", "state", "country",
                "event_date", "event_id",
            ]
        )

    nodes_df = pd.concat([event_df, org_df], ignore_index=True)

    edges_df = pd.concat([attendance_df, connection_df], ignore_index=True)

    return nodes_df, edges_df


def build_custom_edge_graph(df: pd.DataFrame, src_col: str, dst_col: str, edge_label_col: str = None, mapping=None):
    """
    Build a simple A→B graph from custom columns.
    
    Args:
        df: merged DataFrame
        src_col: column name for source nodes
        dst_col: column name for target nodes
        edge_label_col: optional column for edge labels/types
        mapping: optional mapping for extra attributes
    
    Returns:
        nodes_df, edges_df
    """
    mapping = mapping or {}
    
    # Get source and target values
    sources = df[src_col].astype(str).apply(norm_str)
    targets = df[dst_col].astype(str).apply(norm_str)
    
    # Get edge labels if specified
    edge_labels = df[edge_label_col].astype(str).apply(norm_str) if edge_label_col and edge_label_col in df.columns else pd.Series([""] * len(df))
    
    # Build nodes from unique values in both columns
    all_node_names = pd.concat([sources, targets]).unique()
    all_node_names = [n for n in all_node_names if n]  # filter empty
    
    # Get extra attributes if specified
    extra_attrs = mapping.get("extraAttrs", [])
    
    node_rows = []
    for name in all_node_names:
        node_id = f"node_{slug(canonical_key(name))}"
        label = pretty_name(name)
        
        # Determine type based on which column(s) it appears in
        is_source = name in sources.values
        is_target = name in targets.values
        if is_source and is_target:
            node_type = "both"
        elif is_source:
            node_type = "source"
        else:
            node_type = "target"
        
        row_data = {
            "Id": node_id,
            "Label": label,
            "type": node_type,
        }
        
        # Add extra attributes if any
        for attr in extra_attrs:
            if attr in df.columns:
                # Find first non-empty value for this node
                matches = df[(sources == name) | (targets == name)][attr]
                row_data[attr] = first_non_empty(matches) if len(matches) > 0 else ""
        
        node_rows.append(row_data)
    
    nodes_df = pd.DataFrame(node_rows)
    
    # Build edges
    edge_rows = []
    for src, dst, label in zip(sources, targets, edge_labels):
        if not src or not dst:
            continue
        
        src_id = f"node_{slug(canonical_key(src))}"
        dst_id = f"node_{slug(canonical_key(dst))}"
        
        edge_rows.append({
            "Source": src_id,
            "Target": dst_id,
            "edge_type": norm_str(label) if label else "connection",
            "weight": 1,
        })
    
    if edge_rows:
        edges_df = pd.DataFrame(edge_rows)
        # Aggregate by source, target, edge_type
        edges_df = edges_df.groupby(["Source", "Target", "edge_type"], dropna=False)["weight"].sum().reset_index()
    else:
        edges_df = pd.DataFrame(columns=["Source", "Target", "edge_type", "weight"])
    
    return nodes_df, edges_df


# ------------------ top-level conversion ------------------

def convert_many(infiles, outdir=OUTPUT_FOLDER, fmt="gephi", mapping=None, graph_mode="org_event", src_col=None, dst_col=None, edge_label_col=None):
    """
    Convert files to graph format.
    
    Args:
        infiles: list of file paths
        outdir: output directory
        fmt: output format ("gephi" or "kumu")
        mapping: optional column mapping dict
        graph_mode: "org_event", "org_org", or "custom_ab"
        src_col: source column for custom_ab mode
        dst_col: target column for custom_ab mode
        edge_label_col: edge label column for custom_ab mode
    """
    df = merge_files(infiles)
    
    # Choose graph builder based on mode
    if graph_mode == "custom_ab":
        if not src_col or not dst_col:
            raise RuntimeError("custom_ab mode requires src_col and dst_col")
        nodes_df, edges_df = build_custom_edge_graph(df, src_col, dst_col, edge_label_col, mapping)
    elif graph_mode == "org_org":
        # For org-org mode, we still use the same builder but might want to filter out event nodes
        # For now, use the same logic - we can refine this later
        nodes_df, edges_df = build_graph_from_responses(df, mapping)
        # Filter to only org nodes and org-org edges
        nodes_df = nodes_df[nodes_df["type"] == "org"]
        edges_df = edges_df[edges_df["edge_type"] == "connection"]
    else:  # org_event (default)
        nodes_df, edges_df = build_graph_from_responses(df, mapping)

    os.makedirs(outdir, exist_ok=True)

    if fmt.lower() == "kumu":
        nodes_out = nodes_df.rename(columns={"Id": "id"})
        edges_out = edges_df.rename(columns={"Source": "from", "Target": "to"})
        nodes_name, edges_name = "nodes_kumu.csv", "edges_kumu.csv"
    else:
        nodes_out, edges_out = nodes_df, edges_df
        nodes_name, edges_name = "nodes_gephi.csv", "edges_gephi.csv"

    nodes_path = os.path.join(outdir, nodes_name)
    edges_path = os.path.join(outdir, edges_name)
    nodes_out.to_csv(nodes_path, index=False)
    edges_out.to_csv(edges_path, index=False)

    return nodes_name, edges_name, len(nodes_out), len(edges_out)


# ------------------ Flask routes ------------------

@app.route("/download/<path:filename>")
def download(filename):
    return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)


@app.route("/inspect", methods=["POST"])
def inspect():
    """
    Inspect uploaded file and return column headers.
    Allows frontend to build mapping UI dynamically.
    """
    try:
        file = request.files.get("file")
        if not file or not getattr(file, "filename", ""):
            return jsonify({"error": "No file uploaded."}), 400
        
        filename = secure_filename(file.filename or "temp.csv")
        ext = os.path.splitext(filename)[1].lower()
        
        if ext not in ALLOWED_EXT:
            return jsonify({"error": f"Unsupported extension '{ext}'. Allowed: {sorted(ALLOWED_EXT)}"}), 415
        
        # Save temporarily
        temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{filename}")
        file.save(temp_path)
        
        # Read headers
        try:
            df = read_one(temp_path)
            columns = [c for c in df.columns if c != "__source_file__"]
            
            # Clean up
            os.remove(temp_path)
            
            return jsonify({
                "columns": columns,
                "row_count": len(df)
            }), 200
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e
            
    except Exception as e:
        import traceback, sys
        traceback.print_exc(file=sys.stderr)
        return jsonify({"error": f"Failed to inspect file: {type(e).__name__}: {e}"}), 500


@app.route("/upload", methods=["POST"])
def upload():
    try:
        fmt = (request.form.get("format") or "gephi").lower().strip()
        if fmt not in {"gephi", "kumu"}:
            fmt = "gephi"
        
        # Get graph mode and mapping
        graph_mode = (request.form.get("graph_mode") or "org_event").lower().strip()
        mapping_raw = request.form.get("mapping")
        mapping = json.loads(mapping_raw) if mapping_raw else None
        
        # Get custom columns for custom_ab mode
        src_col = request.form.get("src_col")
        dst_col = request.form.get("dst_col")
        edge_label_col = request.form.get("edge_label_col")

        files = request.files.getlist("files") or request.files.getlist("file")
        files = [f for f in files if getattr(f, "filename", "")]
        if not files:
            return jsonify({"error": "No files uploaded. Use form-data with one or more 'files' parts."}), 400

        saved_paths = []
        for f in files:
            raw = secure_filename(f.filename or "uploaded.csv")
            ext = os.path.splitext(raw)[1].lower()
            if ext not in ALLOWED_EXT:
                return jsonify({"error": f"Unsupported extension for '{raw}'. Allowed: {sorted(ALLOWED_EXT)}"}), 415
            save_path = _unique_path(UPLOAD_FOLDER, raw)
            f.save(save_path)
            saved_paths.append(save_path)

        nodes_file, edges_file, n_nodes, n_edges = convert_many(
            saved_paths, OUTPUT_FOLDER, fmt, 
            mapping=mapping, 
            graph_mode=graph_mode,
            src_col=src_col,
            dst_col=dst_col,
            edge_label_col=edge_label_col
        )

        msg = f"Converted ({n_nodes} nodes, {n_edges} edges) → format: {fmt.upper()}"

        return jsonify({
            "message": msg,
            "nodes_url": f"http://127.0.0.1:5002/download/{nodes_file}",
            "edges_url": f"http://127.0.0.1:5002/download/{edges_file}",
        }), 200

    except Exception as e:
        import traceback, sys
        traceback.print_exc(file=sys.stderr)
        return jsonify({"error": f"Conversion failed: {type(e).__name__}: {e}"}), 500


if __name__ == "__main__":
    # Use port 5002 to avoid conflict with macOS AirPlay Receiver (port 5000)
    app.run(debug=True, port=5002)
