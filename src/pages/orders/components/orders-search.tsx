import { Button, Flex, Input } from "@skeinui/ui";
import { useState } from "react";
import type { Filter } from "@/lib/list-query";
import { QueryBuilder } from "@/modules/query-builder";
import type { QueryField } from "@/modules/query-builder";
import { ordersAdapter } from "../api";
import { useOrdersTranslation } from "../locales";

/** What the search asks for, as parts of a `ListQuery`. */
export interface OrdersSearchValue {
  keyword?: string;
  filter?: Filter;
}

/** A keyword (Enter searches), and the conditions on the fields the API takes, as chips. */
export function OrdersSearch({ onSearch }: { onSearch: (value: OrdersSearchValue) => void }) {
  const { t } = useOrdersTranslation();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<Filter | undefined>();
  const search = (next: OrdersSearchValue) =>
    onSearch({ keyword: next.keyword?.trim() || undefined, filter: next.filter });
  const fields: QueryField[] = [
    {
      name: "status",
      label: t("filters.status"),
      type: "enum",
      options: ["pending", "paid", "shipped", "cancelled"].map((v) => ({
        value: v,
        label: t(`enum.status.${v}`),
      })),
    },
  ];
  return (
    <Flex gap="sm" align="center" wrap>
      <div className="table-keyword">
        <Input
          fullWidth
          size="sm"
          aria-label={t("filters.q")}
          placeholder={t("filters.q")}
          value={keyword}
          onValueChange={setKeyword}
          onKeyDown={(e) => {
            if (e.key === "Enter") search({ keyword, filter: filter });
          }}
          onBlur={() => search({ keyword, filter: filter })}
        />
      </div>
      <QueryBuilder
        fields={fields}
        value={filter}
        capabilities={ordersAdapter.capabilities}
        onChange={(next) => {
          setFilter(next);
          search({ keyword, filter: next });
        }}
      />
      {keyword || filter ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setKeyword("");
            setFilter(undefined);
            search({});
          }}
        >
          {t("filter.reset")}
        </Button>
      ) : null}
    </Flex>
  );
}
