
from fastapi import FastAPI
from schemas import FloorplanInput  # Import from schemas
from floorplan_service import generate_floorplan_from_input

app = FastAPI()

@app.post("/generate-floorplan")
async def generate_floorplan_endpoint(input_data: FloorplanInput):
    """
    ユーザーの入力に基づいて間取り図を生成するAPIエンドポイント。
    """
    try:
        # 新しいサービス関数を呼び出す
        result_layout = generate_floorplan_from_input(input_data)
        if "error" in result_layout:
             return {
                "status": "error",
                "message": result_layout["error"]
            }
        return {
            "status": "success",
            "message": "間取り図の生成が完了しました。",
            "data": result_layout
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"間取り図の生成中にエラーが発生しました: {str(e)}"
        }

@app.get("/")
def read_root():
    return {"message": "Python backend is running"}
