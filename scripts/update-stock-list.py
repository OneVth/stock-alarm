#!/usr/bin/env python3
"""
KRX 종목 리스트 갱신 스크립트

FinanceDataReader를 사용하여 KOSPI/KOSDAQ/ETF 전 종목을 조회하고
src/data/krx-stocks.json 파일을 갱신합니다.

사용법:
    python scripts/update-stock-list.py

월 1회 cron으로 실행하는 것을 권장합니다.
"""

import json
import sys
from pathlib import Path

try:
    import FinanceDataReader as fdr
except ImportError:
    print("ERROR: FinanceDataReader가 설치되지 않았습니다.")
    print("  pip install finance-datareader")
    sys.exit(1)


def main():
    output_path = Path(__file__).resolve().parent.parent / "src" / "data" / "krx-stocks.json"

    print("종목 리스트 갱신을 시작합니다...")

    try:
        print("  KOSPI 종목 조회 중...")
        kospi = fdr.StockListing("KOSPI")
        print(f"  KOSPI: {len(kospi)}개")

        print("  KOSDAQ 종목 조회 중...")
        kosdaq = fdr.StockListing("KOSDAQ")
        print(f"  KOSDAQ: {len(kosdaq)}개")

        print("  ETF 종목 조회 중...")
        etf = fdr.StockListing("ETF/KR")
        etf = etf.rename(columns={"Symbol": "Code"})
        print(f"  ETF: {len(etf)}개")
    except Exception as e:
        print(f"ERROR: 종목 리스트 조회 실패: {e}")
        sys.exit(1)

    stocks = []
    seen_codes = set()

    for df, market in [(kospi, "KOSPI"), (kosdaq, "KOSDAQ"), (etf, "ETF")]:
        for _, row in df.iterrows():
            code = str(row["Code"]).strip()
            if code and code not in seen_codes:
                seen_codes.add(code)
                stocks.append({
                    "code": code,
                    "name": str(row["Name"]).strip(),
                    "market": market,
                })

    print(f"\n총 {len(stocks)}개 종목 (중복 제거 완료)")

    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(stocks, f, ensure_ascii=False, indent=2)
        print(f"저장 완료: {output_path}")
    except Exception as e:
        print(f"ERROR: 파일 저장 실패: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
