import pymupdf

def is_white(color):
    if color is None:
        return False
    if isinstance(color, (int, float)):
        return color == 0xFFFFFF or color == -1
    if isinstance(color, (list, tuple)):
        return all(c >= 0.99 for c in color) or all(c == 255 for c in color)
    return False

def get_raw_lines(textpage, clip=None, tolerance=3, ignore_invisible=True):
    if textpage is None:
        return []
    try:
        raw = textpage.extractRAWDICT()
    except Exception:
        return []
    lines = []
    for block in raw.get("blocks", []):
        if block.get("type") == 0:  # text block
            for line in block.get("lines", []):
                bbox = pymupdf.Rect(line.get("bbox"))
                if clip and not bbox.intersects(clip):
                    continue
                spans = line.get("spans", [])
                lines.append((bbox, spans))
    return lines
