def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from image using pytesseract OCR."""
    try:
        import pytesseract
        from PIL import Image
        import io
        image = Image.open(io.BytesIO(file_bytes))
        # Convert to RGB if needed
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        text = pytesseract.image_to_string(image, lang="eng")
        return text.strip()
    except Exception as e:
        print(f"OCR extraction error: {e}")
        return ""

def preprocess_image(file_bytes: bytes) -> bytes:
    """Preprocess image for better OCR accuracy."""
    try:
        from PIL import Image, ImageEnhance, ImageFilter
        import io
        image = Image.open(io.BytesIO(file_bytes))
        # Convert to grayscale
        image = image.convert("L")
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        # Apply sharpening
        image = image.filter(ImageFilter.SHARPEN)
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()
    except Exception as e:
        print(f"Image preprocessing error: {e}")
        return file_bytes
