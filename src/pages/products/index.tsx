import { Button, Card, Flex, Popconfirm, Text, toast } from "@skeinui/ui";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { downloadCsv } from "@/lib/export-csv";
import type { ListQuery } from "@/lib/list-query";
import { Access } from "@/modules/access";
import { TableTools } from "@/modules/table-tools";
import { Page } from "@/skein-shell";
import { deleteProduct, fetchProducts, productsKeys } from "./api";
import type { Product } from "./api";
import { ProductFormDialog } from "./components/product-form-dialog";
import { productsColumns, ProductsTable } from "./components/products-table";
import type { ProductsColumn } from "./components/products-table";
import { useProductsTranslation } from "./locales";

export function ProductsPage() {
  const { t } = useProductsTranslation();
  const queryClient = useQueryClient();
  const [query] = useState<ListQuery>({ page: 1, pageSize: 10 });
  /** The columns in their order, and the ones shown. */
  const [order, setOrder] = useState<ProductsColumn[]>([...productsColumns]);
  const [visible, setVisible] = useState<string[]>([...productsColumns]);
  const shown = order.filter((c) => visible.includes(c));
  /** undefined: closed; null: creating; a row: editing it. */
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  /** The ids of the ticked rows. */
  const [selected, setSelected] = useState<readonly string[]>([]);
  const { data, isFetching, refetch } = useQuery({
    queryKey: productsKeys.list(query),
    queryFn: () => fetchProducts(query),
    placeholderData: keepPreviousData,
  });
  const rows = data?.items ?? [];
  // Only the rows on screen count: another page, a new search or a sort leaves the ticked ones out of what is exported or deleted
  const selectedRows = rows.filter((row) => selected.includes(row.sku));
  const remove = useMutation({
    mutationFn: (row: Product) => deleteProduct(row.sku),
    onSuccess: (_, row) => {
      toast.success(t("deleted", { item: String(row.title) }));
      void queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: (error) => toast.danger(error.message),
  });
  // The API deletes one row at a time: one request per ticked row, and the ones that failed are counted
  const removeMany = useMutation({
    mutationFn: (rows: Product[]) => Promise.allSettled(rows.map((row) => deleteProduct(row.sku))),
    onSuccess: (results) => {
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed < results.length)
        toast.success(t("deletedMany", { count: results.length - failed }));
      if (failed > 0) toast.danger(t("deleteManyFailed", { count: failed }));
      setSelected([]);
      void queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
  });

  /** What a column reads as in the CSV. */
  const exportCell: Record<ProductsColumn, (row: Product) => unknown> = {
    title: (row) => row.title,
    price: (row) => row.price,
    "in-stock": (row) => t(row["in-stock"] ? "bool.yes" : "bool.no"),
    category: (row) => (row.category ? t(`enum.category.${row.category}`) : ""),
    homepage: (row) => row.homepage,
  };
  /** The rows as a CSV file, in the columns shown: what is on screen (this page, with its search and sort) or the ticked ones. */
  const exportRows = (list: readonly Product[]) =>
    downloadCsv(
      "products.csv",
      shown.map((c) => t(`fields.${c}`)),
      list.map((row) => shown.map((c) => exportCell[c](row))),
    );

  return (
    <Page
      title={t("title")}
      description={t("description")}
      actions={
        <Access code="products:create">
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
              <div className="table-bar-main"></div>
              <TableTools
                onRefresh={() => void refetch()}
                refreshing={isFetching}
                columns={order.map((key) => ({ key, label: t(`fields.${key}`) }))}
                visible={visible}
                onVisibleChange={setVisible}
                onOrderChange={(keys) => setOrder(keys as ProductsColumn[])}
                onExport={() => exportRows(rows)}
              />
            </div>
            {selectedRows.length > 0 ? (
              <Flex align="center" gap="md" wrap>
                <Text tone="secondary">{t("selected", { count: selectedRows.length })}</Text>
                <Button size="sm" variant="outline" onClick={() => exportRows(selectedRows)}>
                  {t("exportSelected")}
                </Button>
                <Access code="products:delete">
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
            <ProductsTable
              rows={rows}
              columns={shown}
              loading={isFetching}
              selected={selected}
              onSelectedChange={setSelected}
              onEdit={setEditing}
              onDelete={(row) =>
                remove.mutateAsync(row).then(
                  () => undefined,
                  () => undefined,
                )
              }
            />
          </Flex>
        </Card.Body>
      </Card>
      <ProductFormDialog product={editing} onClose={() => setEditing(undefined)} />
    </Page>
  );
}
