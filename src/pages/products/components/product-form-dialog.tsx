import { Dialog, Form, toast } from "@skeinui/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct, updateProduct, productsKeys } from "../api";
import type { Product, ProductInput } from "../api";
import { useProductsTranslation } from "../locales";

/** Creates a row (`product` is null) or edits one; closed when `product` is undefined. */
export function ProductFormDialog({
  product,
  onClose,
}: {
  product: Product | null | undefined;
  onClose: () => void;
}) {
  const { t } = useProductsTranslation();
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (input: ProductInput) =>
      product ? updateProduct(product.sku, input) : createProduct(input),
    onSuccess: (saved) => {
      toast.success(t(product ? "updated" : "created", { item: String(saved.title ?? "") }));
      void queryClient.invalidateQueries({ queryKey: productsKeys.all });
      onClose();
    },
    onError: (error) => toast.danger(error.message),
  });

  return (
    <Dialog open={product !== undefined} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content>
        <Dialog.Title>{product ? t("editTitle") : t("createTitle")}</Dialog.Title>
        <Form
          // A new form for every row, so the default values apply
          key={product ? String(product.sku) : "new"}
          defaultValues={product ? { ...product } : { "in-stock": false }}
          fields={[
            { name: "sku", label: t("fields.sku"), required: true },
            { name: "title", label: t("fields.title"), required: true },
            { name: "price", label: t("fields.price"), type: "number", required: true, min: 0 },
            { name: "in-stock", label: t("fields.in-stock"), type: "switch" },
            {
              name: "category",
              label: t("fields.category"),
              type: "select",
              options: ["books", "games", "music"].map((v) => ({
                value: v,
                label: t(`enum.category.${v}`),
              })),
            },
            { name: "homepage", label: t("fields.homepage"), type: "url" },
          ]}
          submitLabel={t("save")}
          onSubmit={(values) =>
            save.mutateAsync(values as unknown as ProductInput).then(
              () => undefined,
              () => undefined,
            )
          }
        />
      </Dialog.Content>
    </Dialog>
  );
}
