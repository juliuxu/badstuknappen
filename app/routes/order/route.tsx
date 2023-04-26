import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { orderInfoSchema, placeOrder } from "./order.server";

export const meta: V2_MetaFunction = () => {
  return [{ title: "Hello" }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const orderInfo = orderInfoSchema.parse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  const result = placeOrder(orderInfo);
  return defer({
    orderInfo,
    result,
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Hello, world</h1>
      <div>
        <Suspense fallback={"loading..."}>
          <Await resolve={data.result}>
            {(result) => <pre>{JSON.stringify(result, null, 2)}</pre>}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}
