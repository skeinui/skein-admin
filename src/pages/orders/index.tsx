import { Button, Card, Flex, Pagination, Popconfirm, Text, toast } from "@skeinui/ui";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { downloadCsv } from "@/lib/export-csv";
import type { ListQuery, Sort } from "@/lib/list-query";
import { Access } from "@/modules/access";
import { TableTools } from "@/modules/table-tools";
import { Page } from "@/skein-shell";
import { deleteOrder, fetchOrders, ordersKeys } from "./api";
import type { Order } from "./api";
import { OrdersSearch } from "./components/orders-search";
import { OrderFormDialog } from "./components/order-form-dialog";
import { ordersColumns, OrdersTable } from "./components/orders-table";
import type { OrdersColumn } from "./components/orders-table";
import { useOrdersTranslation } from "./locales";

export function OrdersPage() {
  const { t } = useOrdersTranslation();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<ListQuery>({ page: 1, pageSize: 10 });
  /** The columns in their order, and the ones shown. */
  const [order, setOrder] = useState<OrdersColumn[]>([...ordersColumns]);
  const [visible, setVisible] = useState<string[]>([...ordersColumns]);
  const shown = order.filter((c) => visible.includes(c));
  /** undefined: closed; null: creating; a row: editing it. */
  const [editing, setEditing] = useState<Order | null | undefined>(undefined);
  /** The ids of the ticked rows. */
  const [selected, setSelected] = useState<readonly number[]>([]);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ordersKeys.list(query),
    queryFn: () => fetchOrders(query),
    placeholderData: keepPreviousData,
  });
  const rows = data?.items ?? [];
  // Only the rows on screen count: another page, a new search or a sort leaves the ticked ones out of what is exported or deleted
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const remove = useMutation({
    mutationFn: (row: Order) => deleteOrder(row.id),
    onSuccess: (_, row) => {
      toast.success(t("deleted", { item: String(row.customer) }));
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all });
    },
    onError: (error) => toast.danger(error.message),
  });
  // The API deletes one row at a time: one request per ticked row, and the ones that failed are counted
  const removeMany = useMutation({
    mutationFn: (rows: Order[]) => Promise.allSettled(rows.map((row) => deleteOrder(row.id))),
    onSuccess: (results) => {
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed < results.length)
        toast.success(t("deletedMany", { count: results.length - failed }));
      if (failed > 0) toast.danger(t("deleteManyFailed", { count: failed }));
      setSelected([]);
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all });
    },
  });

  /** What a column reads as in the CSV. */
  const exportCell: Record<OrdersColumn, (row: Order) => unknown> = {
    customer: (row) => row.customer,
    email: (row) => row.email,
    status: (row) => (row.status ? t(`enum.status.${row.status}`) : ""),
    amount: (row) => row.amount,
    paid: (row) => t(row.paid ? "bool.yes" : "bool.no"),
    deliverOn: (row) => row.deliverOn,
  };
  /** The rows as a CSV file, in the columns shown: what is on screen (this page, with its search and sort) or the ticked ones. */
  const exportRows = (list: readonly Order[]) =>
    downloadCsv(
      "orders.csv",
      shown.map((c) => t(`fields.${c}`)),
      list.map((row) => shown.map((c) => exportCell[c](row))),
    );

  return (
    <Page
      title={t("title")}
      description={t("description")}
      actions={
        <Access code="orders:create">
          <Button
            color="primary"
            startContent={<Plus size={16} />}
            onClick={() => setEditing(null)}
          >
            {t("create")}
          </Button>
        </Access>
      }
    >
      <Card>
        <Card.Body>
          <Flex direction="column" gap="md">
            <div className="table-bar">
              <div className="table-bar-main">
                <OrdersSearch
                  onSearch={(search) =>
                    setQuery((q) => ({ page: 1, pageSize: q.pageSize, sort: q.sort, ...search }))
                  }
                />
              </div>
              <TableTools
                onRefresh={() => void refetch()}
                refreshing={isFetching}
                columns={order.map((key) => ({ key, label: t(`fields.${key}`) }))}
                visible={visible}
                onVisibleChange={setVisible}
                onOrderChange={(keys) => setOrder(keys as OrdersColumn[])}
                onExport={() => exportRows(rows)}
              />
            </div>
            {selectedRows.length > 0 ? (
              <Flex align="center" gap="md" wrap>
                <Text tone="secondary">{t("selected", { count: selectedRows.length })}</Text>
                <Button size="sm" variant="outline" onClick={() => exportRows(selectedRows)}>
                  {t("exportSelected")}
                </Button>
                <Access code="orders:delete">
                  <Popconfirm
                    tone="danger"
                    title={t("deleteManyConfirm", { count: selectedRows.length })}
                    confirmLabel={t("delete")}
                    cancelLabel={t("cancel")}
                    onConfirm={() =>
                      removeMany.mutateAsync(selectedRows).then(
                        () => undefined,
                        () => undefined,
                      )
                    }
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      color="danger"
                      loading={removeMany.isPending}
                    >
                      {t("deleteSelected")}
                    </Button>
                  </Popconfirm>
                </Access>
                <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                  {t("clear")}
                </Button>
              </Flex>
            ) : null}
            <OrdersTable
              rows={rows}
              columns={shown}
              loading={isFetching}
              selected={selected}
              onSelectedChange={setSelected}
              sort={query.sort?.[0]}
              onSort={(field) =>
                setQuery((q) => ({ ...q, page: 1, sort: nextSort(q.sort?.[0], field) }))
              }
              onEdit={setEditing}
              onDelete={(row) =>
                remove.mutateAsync(row).then(
                  () => undefined,
                  () => undefined,
                )
              }
            />
            <Flex justify="end">
              <Pagination
                variant="pages"
                page={query.page}
                pageSize={query.pageSize}
                total={data?.total ?? 0}
                pageSizeOptions={[10, 20, 50]}
                onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
                onPageSizeChange={(pageSize) => setQuery((q) => ({ ...q, pageSize, page: 1 }))}
              />
            </Flex>
          </Flex>
        </Card.Body>
      </Card>
      <OrderFormDialog order={editing} onClose={() => setEditing(undefined)} />
    </Page>
  );
}

/** What a click on a column's header does: ascending, then descending, then not sorted. */
function nextSort(sort: Sort | undefined, field: string): ListQuery["sort"] {
  if (sort?.field !== field) return [{ field, order: "asc" }];
  return sort.order === "asc" ? [{ field, order: "desc" }] : undefined;
}
