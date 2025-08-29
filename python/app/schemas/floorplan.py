from pydantic import BaseModel, Field
from typing import List, Optional

# 部屋の設定を表すモデル
class RoomConfig(BaseModel):
    name: str
    width: float
    depth: float
    min_width: Optional[float] = None
    min_depth: Optional[float] = None
    floor: int
    fixedsize: bool = False
    connections: List[str] = []
    value: int = 1 # 面積最大化のための重み

# 全体の間取り生成に必要な入力モデル
class FloorplanInput(BaseModel):
    land_width_mm: int = Field(default=6370, description="土地の幅 (mm)")
    land_depth_mm: int = Field(default=9100, description="土地の奥行き (mm)")
    room_configs: List[RoomConfig] # ユーザーが設定した各部屋の詳細
