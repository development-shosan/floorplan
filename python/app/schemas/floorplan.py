from pydantic import BaseModel, Field
from typing import Dict, Any

# Node.jsバックエンドから渡されるデータ構造に一致する新しい入力モデル
class FloorplanInput(BaseModel):
    job_id: str
    title: str
    clientName: str
    layout_conditions: Dict[str, Any]