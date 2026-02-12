"""종목 리스트 캐시 갱신 스크립트

매일 장 시작 전 cron으로 실행하여 종목 리스트를 JSON 파일로 캐시한다.
이를 통해 검색 API 응답 속도를 개선한다.

Usage:
    uv run python scripts/update_stock_list.py

Cron example (매일 평일 08:00):
    0 8 * * 1-5  cd /path/to/stock-alarm && uv run python scripts/update_stock_list.py
"""

import json
import sys
from datetime import datetime
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))


def update_stock_list():
    """FinanceDataReader에서 종목 리스트를 조회하여 JSON 파일로 저장한다."""
    import FinanceDataReader as fdr

    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] 종목 리스트 갱신 시작")

    try:
        kospi = fdr.StockListing("KOSPI")
        kosdaq = fdr.StockListing("KOSDAQ")
        etf = fdr.StockListing("ETF/KR")
        etf = etf.rename(columns={"Symbol": "Code"})

        print(f"  KOSPI: {len(kospi)}개, KOSDAQ: {len(kosdaq)}개, ETF: {len(etf)}개")

        # 필요한 필드만 추출하여 리스트로 변환
        stocks = []
        seen_codes = set()

        for df, market in [(kospi, "KOSPI"), (kosdaq, "KOSDAQ"), (etf, "ETF")]:
            for _, row in df.iterrows():
                code = str(row["Code"]).strip()
                if code and code not in seen_codes:
                    seen_codes.add(code)
                    stocks.append(
                        {
                            "code": code,
                            "name": str(row["Name"]).strip(),
                            "market": market,
                        }
                    )

        # JSON 파일로 저장
        data_dir = project_root / "data"
        data_dir.mkdir(exist_ok=True)
        cache_path = data_dir / "stock_list.json"

        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(stocks, f, ensure_ascii=False)

        print(f"  총 {len(stocks)}개 종목 저장 완료: {cache_path}")
        return True

    except Exception as e:
        print(f"  오류 발생: {e}", file=sys.stderr)
        return False


if __name__ == "__main__":
    success = update_stock_list()
    sys.exit(0 if success else 1)
