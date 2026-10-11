import { NextRequest, NextResponse } from "next/server";
import {
  createQcRecord,
  getQcRecords,
  type QcConclusion,
} from "@/packages/modules/inventory/qcService";
import type { StorageTempZone } from "@/packages/modules/inventory/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const records = getQcRecords();
    return NextResponse.json({ success: true, records }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      supplier,
      sku,
      productName,
      zone,
      packagingOk,
      labelViOk,
      productionDate,
      expiryDate,
      tempC,
      photos,
      conclusion,
      signedBy,
      note,
    } = body;

    if (!supplier || typeof supplier !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu thông tin nhà cung cấp" }, { status: 400 });
    }
    if (!sku || typeof sku !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu mã SKU" }, { status: 400 });
    }
    if (!productName || typeof productName !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu tên sản phẩm" }, { status: 400 });
    }
    if (!zone || typeof zone !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu vùng nhiệt độ" }, { status: 400 });
    }
    if (typeof packagingOk !== "boolean") {
      return NextResponse.json({ success: false, error: "Thiếu đánh giá bao bì" }, { status: 400 });
    }
    if (typeof labelViOk !== "boolean") {
      return NextResponse.json({ success: false, error: "Thiếu đánh giá nhãn Việt" }, { status: 400 });
    }
    if (!productionDate || typeof productionDate !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu ngày sản xuất" }, { status: 400 });
    }
    if (!expiryDate || typeof expiryDate !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu hạn sử dụng" }, { status: 400 });
    }
    if (!conclusion || typeof conclusion !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu kết luận KCS" }, { status: 400 });
    }
    if (!signedBy || typeof signedBy !== "string") {
      return NextResponse.json({ success: false, error: "Thiếu thông tin ký duyệt" }, { status: 400 });
    }

    const record = createQcRecord({
      supplier,
      sku,
      productName,
      zone: zone as StorageTempZone,
      packagingOk,
      labelViOk,
      productionDate,
      expiryDate,
      tempC: tempC !== null && tempC !== undefined && tempC !== "" ? Number(tempC) : null,
      photos: Array.isArray(photos) ? photos : [],
      conclusion: conclusion as QcConclusion,
      signedBy,
      note: note || undefined,
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
