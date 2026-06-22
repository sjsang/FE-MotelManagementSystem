import React, { useState, useRef, useCallback } from "react";

// Kiểm tra quốc tịch Việt Nam (hỗ trợ cả chuẩn cũ và chuẩn quốc tế mới)
const isViet = (quoctich) =>
    quoctich === "Việt Nam" || quoctich === "VNM - Viet Nam";


export default function SearchableCustomerSelect({
    label,
    customers,
    selectedCustomer,
    onSelect,
    onClear,
    onEditClick,
    excludeIds,
    onAddDirectClick,
    onLoadMore,
    hasMore,
    loadingMore,
    dropdownAlign = "down",
}) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Detect scroll đến gần cuối dropdown → gọi lazy load
    const handleDropdownScroll = useCallback(() => {
        const el = dropdownRef.current;
        if (!el || !onLoadMore || !hasMore || loadingMore) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        // Trigger khi đã cuộn được 80% chiều cao
        if (scrollTop + clientHeight >= scrollHeight * 0.8) {
            onLoadMore();
        }
    }, [onLoadMore, hasMore, loadingMore]);

    const filtered = customers.filter((c) => {
        if (excludeIds && excludeIds.includes(c._id)) return false;
        const term = search.toLowerCase().trim();
        if (!term) return true;
        const name = c.hoten?.toLowerCase() || "";
        const cccd = c.cccd?.toLowerCase() || "";
        const passport = c.passport?.toLowerCase() || "";
        return (
            name.includes(term) || cccd.includes(term) || passport.includes(term)
        );
    });

    return (
        <div
            className="form-group"
            style={{ position: "relative", marginBottom: "12px" }}
        >
            <label className="form-label" style={{ marginBottom: "4px" }}>
                {label}
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                <div
                    style={{
                        flex: 1,
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    {selectedCustomer ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "var(--bg3)",
                                border: "1px solid var(--border)",
                                borderRadius: "6px",
                                padding: "10px 14px",
                                fontSize: "13px",
                                color: "var(--text)",
                                height: "40px",
                            }}
                        >
                            <div
                                style={{
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <strong style={{ color: "var(--accent)" }}>
                                    {selectedCustomer.hoten}
                                </strong>
                                <span
                                    style={{
                                        marginLeft: 8,
                                        fontSize: "11px",
                                        color: "var(--text3)",
                                    }}
                                >
                                    (
                                    {isViet(selectedCustomer.quoctich)
                                        ? `CCCD: ${selectedCustomer.cccd}`
                                        : `Hộ chiếu: ${selectedCustomer.passport}`}
                                    )
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                                {onEditClick && (
                                    <button
                                        type="button"
                                        onClick={() => onEditClick(selectedCustomer)}
                                        title="Chỉnh sửa thông tin khách"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#8b85ff",
                                            cursor: "pointer",
                                            padding: "2px 5px",
                                            lineHeight: 1,
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                        </svg>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onClear}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        padding: "2px 6px",
                                        lineHeight: 1,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ position: "relative", width: "100%" }}>
                            <input
                                className="form-control"
                                placeholder="Nhập tên hoặc số CCCD/Hộ chiếu để tìm kiếm..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setIsOpen(true);
                                }}
                                onFocus={() => setIsOpen(true)}
                                style={{ height: "40px" }}
                            />
                            {isOpen && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        background: "var(--bg2)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px",
                                        maxHeight: "180px",
                                        overflowY: "auto",
                                        zIndex: 999,
                                        boxShadow: "var(--shadow)",
                                        ...(dropdownAlign === "up"
                                            ? {
                                                bottom: "100%",
                                                marginBottom: "4px",
                                            }
                                            : {
                                                top: "100%",
                                                marginTop: "4px",
                                            }),
                                    }}
                                    ref={dropdownRef}
                                    onScroll={handleDropdownScroll}
                                >
                                    {filtered.length === 0 ? (
                                        <div
                                            style={{
                                                padding: "12px",
                                                color: "var(--text3)",
                                                fontSize: "13px",
                                                textAlign: "center",
                                            }}
                                        >
                                            Không tìm thấy khách hàng nào hợp lệ
                                        </div>
                                    ) : (
                                        <>
                                            {filtered.map((c) => (
                                                <div
                                                    key={c._id}
                                                    onClick={() => {
                                                        onSelect(c);
                                                        setSearch("");
                                                        setIsOpen(false);
                                                    }}
                                                    style={{
                                                        padding: "10px 14px",
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid var(--border)",
                                                        fontSize: "13px",
                                                        color: "var(--text)",
                                                        transition: "background 0.2s",
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor = "var(--bg3)")
                                                    }
                                                    onMouseLeave={(e) =>
                                                    (e.currentTarget.style.backgroundColor =
                                                        "transparent")
                                                    }
                                                >
                                                    <div style={{ fontWeight: 600 }}>{c.hoten}</div>
                                                    <div
                                                        style={{
                                                            fontSize: "11px",
                                                            color: "var(--text3)",
                                                            marginTop: "2px",
                                                        }}
                                                    >
                                                        Quốc tịch: {c.quoctich} •{" "}
                                                        {isViet(c.quoctich)
                                                            ? `CCCD: ${c.cccd}`
                                                            : `Hộ chiếu: ${c.passport}`}
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Lazy load indicator */}
                                            {loadingMore && (
                                                <div style={{
                                                    padding: "8px",
                                                    textAlign: "center",
                                                    fontSize: "12px",
                                                    color: "var(--text3)",
                                                }}>
                                                    ⧗ Đang tải thêm...
                                                </div>
                                            )}
                                            {!hasMore && filtered.length > 0 && (
                                                <div style={{
                                                    padding: "6px",
                                                    textAlign: "center",
                                                    fontSize: "11px",
                                                    color: "var(--text3)",
                                                    borderTop: "1px solid var(--border)",
                                                }}>
                                                    — Đã hiển thị tất cả —
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {isOpen && (
                                <div
                                    style={{
                                        position: "fixed",
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: 998,
                                    }}
                                    onClick={() => setIsOpen(false)}
                                />
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="btn btn-success"
                    style={{
                        padding: "0 14px",
                        height: "40px",
                        background: "#2e7d52",
                        borderColor: "#2e7d52",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "6px",
                        fontSize: "18px",
                        cursor: "pointer",
                    }}
                    onClick={onAddDirectClick}
                    title="Thêm mới khách hàng trực tiếp"
                >
                    ＋
                </button>
            </div>
        </div>
    );
}