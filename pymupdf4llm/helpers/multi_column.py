import pymupdf

def column_boxes(page, paths=None, no_image_text=True, textpage=None, avoid=None, footer_margin=0, header_margin=0, ignore_images=False):
    if page is None:
        return []
    rect = page.rect
    crop_rect = pymupdf.Rect(
        rect.x0,
        rect.y0 + header_margin,
        rect.x1,
        rect.y1 - footer_margin
    )
    return [crop_rect]
