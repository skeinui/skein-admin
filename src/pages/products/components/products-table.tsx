import { Button, Checkbox, Flex, Popconfirm, Table, Tag } from "@skeinui/ui";
import type { ReactNode } from "react";
import { useAccess } from "@/modules/access";
import type { Product } from "../api";
import { useProductsTranslation } from "../locales";

/** The columns that can be hidden or moved (the selection and the actions stay where they are). */
export const productsColumns = ["title", "price", "in-stock", "category", "homepage"] as const;
export type ProductsColumn = (typeof productsColumns)[number];

export function ProductsTable({
  rows,
  columns = productsColumns,
  loading,
  selected,
  onSelectedChange,
  onEdit,
  onDelete,
}: {
  rows: readonly Product[];
  /** The columns shown, in order. */
  columns?: readonly ProductsColumn[];
  loading: boolean;
  /** The ids of the ticked rows. */
  selected: readonly string[];
  onSelectedChange: (ids: readonly string[]) => void;
  onEdit: (row: Product) => void;
  onDelete: (row: Product) => Promise<void>;
}) {
  const { t } = useProductsTranslation();
  const { can } = useAccess();
  const canEdit = can("products:update");
  const canDelete = can("products:delete");
  // Without either, there is nothing to put in the actions column
  const showActions = canEdit || canDelete;
  const ids = rows.map((row) => row.sku);
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
  const cell: Record<ProductsColumn, (row: Product) => ReactNode> = {
    title: (row) => row.title,
    price: (row) => row.price,
    "in-stock": (row) => (
      <Tag variant="soft" color={row["in-stock"] ? "success" : "neutral"}>
        {t(row["in-stock"] ? "bool.yes" : "bool.no")}
      </Tag>
    ),
    category: (row) =>
      row.category ? <Tag variant="soft">{t(`enum.category.${row.category}`)}</Tag> : null,
    homepage: (row) => row.homepage,
  };
  return (
    <Table hoverable loading={loading}>
      <Table.Header>
        <Table.Row>
          <Table.Head kind="select">
            <Checkbox
              aria-label={t("selectAll")}
              checked={allSelected}
              indeterminate={!allSelected && ids.some((id) => selected.includes(id))}
              onCheckedChange={(checked) => onSelectedChange(checked ? ids : [])}
            />
          </Table.Head>
          {columns.map((c) => (
            <Table.Head key={c}>{t(`fields.${c}`)}</Table.Head>
          ))}
          {showActions ? <Table.Head>{t("col.actions")}</Table.Head> : null}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.length === 0 ? (
          <Table.Empty colSpan={columns.length + 1 + (showActions ? 1 : 0)}>
            {loading ? t("loading") : t("empty")}
          </Table.Empty>
        ) : (
          rows.map((row) => (
            <Table.Row key={String(row.sku)} selected={selected.includes(row.sku)}>
              <Table.Cell kind="select">
                <Checkbox
                  aria-label={t("selectRow", { item: String(row.title) })}
                  checked={selected.includes(row.sku)}
                  onCheckedChange={(checked) =>
                    onSelectedChange(
                      checked ? [...selected, row.sku] : selected.filter((id) => id !== row.sku),
                    )
                  }
                />
              </Table.Cell>
              {columns.map((c) => (
                <Table.Cell key={c}>{cell[c](row)}</Table.Cell>
              ))}
              {showActions ? (
                <Table.Cell>
                  <Flex gap="xs">
                    {canEdit ? (
                      <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
                        {t("edit")}
                      </Button>
                    ) : null}
                    {canDelete ? (
                      <Popconfirm
                        tone="danger"
                        title={t("deleteConfirm", { item: String(row.title) })}
                        confirmLabel={t("delete")}
                        cancelLabel={t("cancel")}
                        onConfirm={() => onDelete(row)}
                      >
                        <Button size="sm" variant="ghost" color="danger">
                          {t("delete")}
                        </Button>
                      </Popconfirm>
                    ) : null}
                  </Flex>
                </Table.Cell>
              ) : null}
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table>
  );
}
