import os
import sys
from pathlib import Path
from docx import Document
from docx.oxml.ns import qn
from lxml import etree

def remove_images_from_element(element):
    """Remove all drawing/image elements from an XML element. Returns count of images removed."""
    count = 0
    # Find all inline drawings (inline images)
    for drawing in element.findall('.//' + qn('w:drawing')):
        drawing.getparent().remove(drawing)
        count += 1
    # Find all pict elements (older image format)
    for pict in element.findall('.//' + qn('w:pict')):
        pict.getparent().remove(pict)
        count += 1
    return count

def remove_logos_from_docx(filepath):
    """Remove all images from a docx file (headers, footers, and body). Returns (images_removed, warnings)."""
    doc = Document(filepath)
    total_removed = 0
    warnings = []

    # Remove from document body
    total_removed += remove_images_from_element(doc.element.body)

    # Remove from all sections' headers and footers
    for i, section in enumerate(doc.sections):
        for part_name, part_getter in [
            ("header", lambda s: s.header),
            ("first_page_header", lambda s: s.first_page_header),
            ("even_page_header", lambda s: s.even_page_header),
            ("footer", lambda s: s.footer),
            ("first_page_footer", lambda s: s.first_page_footer),
            ("even_page_footer", lambda s: s.even_page_footer),
        ]:
            try:
                part = part_getter(section)
                if part is not None and part._element is not None:
                    total_removed += remove_images_from_element(part._element)
            except Exception as e:
                warnings.append(f"section[{i}].{part_name}: {e}")

    if total_removed > 0:
        doc.save(filepath)

    return total_removed, warnings

def main():
    base_dir = Path("Project Documents/721814 SOP/721814 SOP/")

    if not base_dir.exists():
        print(f"ERROR: Directory not found: {base_dir}")
        sys.exit(1)

    docx_files = list(base_dir.rglob("*.docx"))
    print(f"Found {len(docx_files)} .docx files to process\n")

    processed = 0
    logos_removed = 0
    errors = []

    for filepath in sorted(docx_files):
        try:
            count, warns = remove_logos_from_docx(str(filepath))
            processed += 1
            if count > 0:
                logos_removed += 1
                print(f"  [REMOVED {count} image(s)] {filepath.name}")
            else:
                print(f"  [no images]    {filepath.name}")
            for w in warns:
                print(f"    WARNING: {w}")
        except Exception as e:
            errors.append((str(filepath), str(e)))
            print(f"  [ERROR]        {filepath.name}: {e}")

    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total files processed : {processed}")
    print(f"  Files with logos removed: {logos_removed}")
    print(f"  Files with no images  : {processed - logos_removed}")
    if errors:
        print(f"  Errors                : {len(errors)}")
        for path, err in errors:
            print(f"    - {path}: {err}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
