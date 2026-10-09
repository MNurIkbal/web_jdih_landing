import { ProdukHukumDetail } from "@/components/produk-hukum-detail";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const produkId = Number(id);

  if (!Number.isInteger(produkId) || produkId <= 0) {
    return null;
  }

  return <ProdukHukumDetail id={produkId} />;
}