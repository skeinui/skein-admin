import { Button, Checkbox, Flex, Popconfirm, Table, Tag } from "@skeinui/ui";
import type { ReactNode } from "react";
import type { Sort } from "@/lib/list-query";
import { useAccess } from "@/modules/access";
import { RouterLink } from "@/skein-shell";
import type { Order } from "../api";
import { useOrdersTranslation } from "../locales";

/** The columns that can be hidden or moved (the selection and the actions stay where they are). */
export const ordersColumns = [
  "customer",
  "email",
  "status",
  "amount",
  "paid",
  "deliverOn",
] as const;
export type OrdersColumn = (typeof ordersColumns)[number];

/** The columns the API can sort by. */
const sortable: ReadonlySet<string> = new Set(["customer", "status", "amount"]);

export function OrdersTable({
  rows,
  columns = ordersColumns,
  loading,
  selected,
  onSelectedChange,
  sort,
  onSort,
  onEdit,
  onDelete,
}: {
  rows: readonly Order[];
  /** The columns shown, in order. */
  columns?: readonly OrdersColumn[];
  loading: boolean;
  /** The ids of the ticked rows. */
  selected: readonly number[];
  onSelectedChange: (ids: readonly number[]) => void;
  sort?: Sort;
  /** A click on a sortable header, with the column's field name. */
  onSort: (field: string) => void;
  onEdit: (row: Order) => void;
  onDelete: (row: Order) => Promise<void>;
}) {
  const { t, i18n } = useOrdersTranslation();
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });
  const { can } = useAccess();
  const canEdit = can("orders:update");
  const canDelete = can("orders:delete");
  // Without either, there is nothing to put in the actions column
  const showActions = canEdit || canDelete;
  const ids = rows.map((row) => row.id);
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));
  const cell: Record<OrdersColumn, (row: Order) => ReactNode> = {
    customer: (row) => (
      <RouterLink
        from="/$tenant/orders"
        to="/$tenant/orders/$id"
        params={(prev) => ({ ...prev, id: String(row.id) })}
      >
        {row.customer}
      </RouterLink>
    ),
    email: (row) => row.email,
    status: (row) =>
      row.status ? <Tag variant="soft">{t(`enum.status.${row.status}`)}</Tag> : null,
    amount: (row) => row.amount,
    paid: (row) => (
      <Tag variant="soft" color={row.paid ? "success" : "neutral"}>
        {t(row.paid ? "bool.yes" : "bool.no")}
      </Tag>
    ),
    deliverOn: (row) => (row.deliverOn ? date.format(new Date(row.deliverOn)) : null),
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
            <Table.Head
              key={c}
              sortable={sortable.has(c)}
              sort={sort?.field === c ? sort.order : undefined}
              onSort={() => onSort(c)}
            >
              {t(`fields.${c}`)}
            </Table.Head>
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
            <Table.Row key={String(row.id)} selected={selected.includes(row.id)}>
              <Table.Cell kind="select">
                <Checkbox
                  aria-label={t("selectRow", { item: String(row.customer) })}
                  checked={selected.includes(row.id)}
                  onCheckedChange={(checked) =>
                    onSelectedChange(
                      checked ? [...selected, row.id] : selected.filter((id) => id !== row.id),
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
                        title={t("deleteConfirm", { item: String(row.customer) })}
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
