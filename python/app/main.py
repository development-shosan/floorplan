from fastapi import FastAPI, BackgroundTasks
from app.schemas.floorplan import FloorplanInput
import time
import requests
import os

app = FastAPI()

# Node.jsバックエンドのコールバックURL
NODE_CALLBACK_URL = os.getenv(
    "NODE_CALLBACK_URL", "http://backend:4000/api/v1/floorplans/callback"
)


def process_floorplan_generation(job_id: str, input_data: FloorplanInput):
    """
    バックグラウンドで間取り図生成をシミュレートし、完了後にコールバックを送信する。
    """
    print(f"[Job: {job_id}] Processing started.")
    # 10秒待機
    time.sleep(10)

    # ダミーの生成結果を作成
    # 実際のアルゴリズムの結果の代わりに、ここで固定のJSONを返す
    dummy_result = {
        "layout_1": {
            "first_floor_area": 120.5,
            "second_floor_area": 95.3,
            "total_floor_area": 215.8,
            "tag": ["南向きLDK", "独立キッチン", "和室あり"],
            "type": "リビングが広いプラン",
            "1": {
                "rooms": [
                    { "name": "エントランス", "x": 6.0, "y": 0.0, "width": 2.0, "height": 2.0 },
                    { "name": "客室", "x": 8.0, "y": 0.0, "width": 3.5, "height": 4.5 },
                    { "name": "浴室", "x": 8.5, "y": 5.5, "width": 2.0, "height": 2.0 },
                    { "name": "脱衣所", "x": 7.0, "y": 5.5, "width": 1.5, "height": 2.0 },
                    { "name": "キッチン", "x": 3.0, "y": 4.0, "width": 3.0, "height": 3.0 },
                    { "name": "リビング", "x": 1.0, "y": 0.0, "width": 5.0, "height": 4.0 },
                    { "name": "ダイニング", "x": 0.0, "y": 4.0, "width": 3.0, "height": 3.0 },
                    { "name": "トイレ1", "x": 9.5, "y": 4.5, "width": 2.0, "height": 1.0 },
                    { "name": "階段1", "x": 0.0, "y": 1.0, "width": 1.0, "height": 3.0 },
                    { "name": "洗面所", "x": 6.0, "y": 5.5, "width": 1.0, "height": 2.0 },
                    { "name": "廊下1", "x": 6.0, "y": 4.5, "width": 3.5, "height": 1.0 },
                    { "name": "収納", "x": 6.0, "y": 2.0, "width": 2.0, "height": 2.0 }
                ],
                "objects": [
                    { "name": "シンク", "x": 3.5, "y": 4.5, "width": 1.0, "height": 2.0 },
                    { "name": "冷蔵庫", "x": 4.5, "y": 4.0, "width": 1.0, "height": 1.0 },
                    { "name": "ダイニングテーブル", "x": 1.0, "y": 5.0, "width": 1.5, "height": 1.5 },
                    { "name": "ソファ", "x": 2.0, "y": 1.0, "width": 2.0, "height": 1.0 }
                ]
            },
            "2": {
                "rooms": [
                    { "name": "廊下", "x": 1.0, "y": 1.0, "width": 8.0, "height": 1.0 },
                    { "name": "クローゼット", "x": 9.0, "y": 0.0, "width": 2.0, "height": 2.0 },
                    { "name": "子供部屋1", "x": 1.0, "y": 2.0, "width": 3.5, "height": 3.5 },
                    { "name": "子供部屋2", "x": 4.5, "y": 2.0, "width": 3.5, "height": 3.5 },
                    { "name": "トイレ2", "x": 0.0, "y": 0.0, "width": 1.5, "height": 0.8 },
                    { "name": "寝室", "x": 8.0, "y": 2.0, "width": 3.5, "height": 3.5 },
                    { "name": "階段2", "x": 0.0, "y": 1.0, "width": 1.0, "height": 3.0 },
                    { "name": "バルコニー", "x": 0.0, "y": 5.5, "width": 12.0, "height": 1.5 }
                ],
                "objects": [
                    { "name": "ベッド", "x": 8.5, "y": 2.5, "width": 2.5, "height": 1.5 },
                    { "name": "机", "x": 9.0, "y": 4.0, "width": 1.5, "height": 1.0 },
                    { "name": "便器", "x": 0.25, "y": 0.25, "width": 0.5, "height": 0.5 }
                ]
            }
        },
        "layout_2": {
            "first_floor_area": 110.0,
            "second_floor_area": 100.0,
            "total_floor_area": 210.0,
            "tag": ["書斎あり", "広い玄関"],
            "type": "書斎のあるプラン",
            "1": {
                "rooms": [
                    { "name": "玄関", "x": 0.0, "y": 0.0, "width": 3.0, "height": 2.0 },
                    { "name": "LDK", "x": 3.0, "y": 0.0, "width": 7.0, "height": 5.0 },
                    { "name": "和室", "x": 0.0, "y": 2.0, "width": 3.0, "height": 3.0 },
                    { "name": "浴室", "x": 7.0, "y": 5.0, "width": 2.0, "height": 2.0 },
                    { "name": "トイレ", "x": 9.0, "y": 5.0, "width": 1.5, "height": 1.0 }
                ],
                "objects": [
                    { "name": "下駄箱", "x": 0.5, "y": 0.5, "width": 1.0, "height": 1.0 },
                    { "name": "ソファ", "x": 4.0, "y": 1.0, "width": 2.5, "height": 1.5 }
                ]
            },
            "2": {
                "rooms": [
                    { "name": "寝室", "x": 0.0, "y": 0.0, "width": 5.0, "height": 4.0 },
                    { "name": "書斎", "x": 5.0, "y": 0.0, "width": 3.0, "height": 3.0 },
                    { "name": "子供部屋", "x": 0.0, "y": 4.0, "width": 4.0, "height": 3.0 },
                    { "name": "バルコニー", "x": 4.0, "y": 4.0, "width": 6.0, "height": 2.0 }
                ],
                "objects": [
                    { "name": "ベッド", "x": 1.0, "y": 1.0, "width": 2.0, "height": 1.5 },
                    { "name": "本棚", "x": 5.5, "y": 0.5, "width": 0.8, "height": 2.0 }
                ]
            }
        },
        "layout_3": {
            "first_floor_area": 130.0,
            "second_floor_area": 80.0,
            "total_floor_area": 210.0,
            "tag": ["二世帯住宅", "広い庭"],
            "type": "二世帯向けプラン",
            "1": {
                "rooms": [
                    { "name": "玄関1", "x": 0.0, "y": 0.0, "width": 2.0, "height": 2.0 },
                    { "name": "LDK1", "x": 2.0, "y": 0.0, "width": 6.0, "height": 5.0 },
                    { "name": "寝室1", "x": 0.0, "y": 2.0, "width": 2.0, "height": 3.0 },
                    { "name": "浴室1", "x": 8.0, "y": 0.0, "width": 2.0, "height": 2.0 },
                    { "name": "玄関2", "x": 0.0, "y": 5.0, "width": 2.0, "height": 2.0 },
                    { "name": "LDK2", "x": 2.0, "y": 5.0, "width": 6.0, "height": 5.0 }
                ],
                "objects": [
                    { "name": "ソファ", "x": 3.0, "y": 1.0, "width": 2.0, "height": 1.0 },
                    { "name": "ベッド", "x": 0.5, "y": 3.0, "width": 1.5, "height": 2.0 }
                ]
            },
            "2": {
                "rooms": [
                    { "name": "子供部屋A", "x": 0.0, "y": 0.0, "width": 4.0, "height": 3.0 },
                    { "name": "子供部屋B", "x": 4.0, "y": 0.0, "width": 4.0, "height": 3.0 },
                    { "name": "主寝室", "x": 0.0, "y": 3.0, "width": 6.0, "height": 4.0 },
                    { "name": "バルコニー", "x": 6.0, "y": 3.0, "width": 4.0, "height": 2.0 }
                ],
                "objects": [
                    { "name": "二段ベッド", "x": 1.0, "y": 0.5, "width": 1.0, "height": 2.0 },
                    { "name": "ダブルベッド", "x": 1.0, "y": 4.0, "width": 2.0, "height": 2.0 }
                ]
            }
        }
    }

    callback_payload = {"jobId": job_id, "status": "completed", "result": dummy_result}

    try:
        print(f"[Job: {job_id}] Sending callback to {NODE_CALLBACK_URL}")
        response = requests.post(NODE_CALLBACK_URL, json=callback_payload)
        response.raise_for_status()  # ステータスコードが2xxでない場合に例外を発生
        print(f"[Job: {job_id}] Callback sent successfully.")
    except requests.exceptions.RequestException as e:
        print(f"[Job: {job_id}] Error sending callback: {e}")


@app.post("/generate-floorplan")
async def generate_floorplan_endpoint(
    input_data: FloorplanInput, background_tasks: BackgroundTasks
):
    """
    ユーザーの入力に基づいて間取り図の生成ジョブをバックグラウンドで開始するAPIエンドポイント。
    """
    # すぐにレスポンスを返し、重い処理はバックグラウンドで実行
    background_tasks.add_task(
        process_floorplan_generation, input_data.job_id, input_data
    )

    return {
        "status": "processing",
        "message": "間取り図の生成リクエストを受け付けました。処理には時間がかかります。",
        "jobId": input_data.job_id,
    }


@app.get("/")
def read_root():
    return {"message": "Python backend is running"}
