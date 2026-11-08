import { Button, Card, Descriptions, Tag, Text } from "@skeinui/ui";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Page } from "@/skein-shell";
import { fetchOrder, ordersKeys } from "./api";
import { useOrdersTranslation } from "./locales";

/** /<tenant>/orders/<id>: one row of the tenant; another tenant's is not found (404 from the API). */
export function OrdersDetailPage({ id }: { id: number }) {
  const { t, i18n } = useOrdersTranslation();
  const navigate = useNavigate();
  const { tenant } = useParams({ strict: false });
  const { data: row, error } = useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => fetchOrder(id),
  });
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });
  const dateTime = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Page
      title={row ? String(row.customer) : error ? t("detail.notFound") : t("loading")}
      actions={
        <Button
          startContent={<ArrowLeft size={16} />}
          onClick={() => void navigate({ to: `/${tenant}/orders` })}
        >
          {t("detail.back")}
        </Button>
      }
    >
      <Card>
        <Card.Body>
          {error ? (
            <Text tone="secondary">{t("detail.notFoundHint", { id: String(id) })}</Text>
          ) : (
            <Descriptions
              column={2}
              items={[
                {
                  label: t("fields.customer"),
                  value: row?.customer,
                },
                {
                  label: t("fields.email"),
                  value: row?.email,
                },
                {
                  label: t("fields.status"),
                  value: row?.status ? t(`enum.status.${row.status}`) : undefined,
                },
                {
                  label: t("fields.amount"),
                  value: row?.amount,
                },
                {
                  label: t("fields.paid"),
                  value: row ? (
                    <Tag variant="soft" color={row.paid ? "success" : "neutral"}>
                      {t(row.paid ? "bool.yes" : "bool.no")}
                    </Tag>
                  ) : undefined,
                },
                {
                  label: t("fields.deliverOn"),
                  value: row?.deliverOn ? date.format(new Date(row.deliverOn)) : undefined,
                },
                {
                  label: t("fields.note"),
                  value: row?.note,
                },
                {
                  label: t("fields.id"),
                  value: row?.id,
                },
                {
                  label: t("fields.createdAt"),
                  value: row?.createdAt ? dateTime.format(new Date(row.createdAt)) : undefined,
                },
              ]}
            />
          )}
        </Card.Body>
      </Card>
    </Page>
  );
}
