from pypdf import PdfReader
from uuid import uuid4

def load_pdf(file_path):
    reader = PdfReader(file_path)

    document_id = str(uuid4())

    text = ""

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

    return text, document_id