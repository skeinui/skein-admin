import { Dialog, Form, toast } from "@skeinui/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, updateOrder, ordersKeys } from "../api";
import type { Order, OrderInput } from "../api";
import { useOrdersTranslation } from "../locales";

/** Creates a row (`order` is null) or edits one; closed when `order` is undefined. */
export function OrderFormDialog({
  order,
  onClose,
}: {
  order: Order | null | undefined;
  onClose: () => void;
}) {
  const { t } = useOrdersTranslation();
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: (input: OrderInput) => (order ? updateOrder(order.id, input) : createOrder(input)),
    onSuccess: (saved) => {
      toast.success(t(order ? "updated" : "created", { item: String(saved.customer ?? "") }));
      void queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      onClose();
    },
    onError: (error) => toast.danger(error.message),
  });

  return (
    <Dialog open={order !== undefined} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content>
        <Dialog.Title>{order ? t("editTitle") : t("createTitle")}</Dialog.Title>
        <Form
          // A new form for every row, so the default values apply
          key={order ? String(order.id) : "new"}
          defaultValues={order ? { ...order } : { status: "pending", paid: false }}
          fields={[
            {
              name: "customer",
              label: t("fields.customer"),
              required: true,
              minLength: 2,
              maxLength: 60,
            },
            { name: "email", label: t("fields.email"), type: "email", required: true },
            {
              name: "status",
              label: t("fields.status"),
              type: "select",
              required: true,
              options: ["pending", "paid", "shipped", "cancelled"].map((v) => ({
                value: v,
                label: t(`enum.status.${v}`),
              })),
            },
            {
              name: "amount",
              label: t("fields.amount"),
              type: "number",
              required: true,
              min: 0,
              max: 10000,
            },
            { name: "paid", label: t("fields.paid"), type: "switch" },
            { name: "deliverOn", label: t("fields.deliverOn"), type: "date" },
            { name: "note", label: t("fields.note"), type: "textarea", maxLength: 500 },
          ]}
          submitLabel={t("save")}
          onSubmit={(values) =>
            save.mutateAsync(values as unknown as OrderInput).then(
              () => undefined,
              () => undefined,
            )
          }
        />
      </Dialog.Content>
    </Dialog>
  );
}
