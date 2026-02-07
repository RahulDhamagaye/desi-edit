import { contentfulClient } from "@/lib/contentful";
import { ContentfulAsset } from "@/types/contentful";
import Image from "next/image";
import Link from "next/link";

type Product = {
  name?: string;
  slug?: string;
  price?: number;
  discountPrice?: number;
  images?: ContentfulAsset[];
  category?: string;
  inStock?: boolean;
};

export default async function HomePage() {
  // Fetch featured products
  const res = await contentfulClient.getEntries({
    content_type: "product",
    "fields.featured": true,
    limit: 8,
    order: ["-sys.createdAt"],
  });

  const products = res.items.map((item: any) => item.fields as Product);

  return (
    <main className="bg-gray-100">
      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">
          Featured Products
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            
          {products.map((p, idx) => {
            const imageUrl =
                p.images?.[0]?.fields?.file?.url
                ? `https:${p.images[0].fields.file.url}`
                : "/placeholder.jpg";


            const productUrl = `/${p.category}/${p.slug}`;

            return (
              <Link
                key={idx}
                href={productUrl}
                className="bg-white rounded-lg border hover:shadow-lg transition"
              >
                {/* IMAGE */}
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-t-lg p-4">
                  <Image
                    src={imageUrl}
                    alt={p.name || "Product"}
                    width={220}
                    height={320}
                    className="object-contain"
                  />
                </div>

                {/* INFO */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold truncate">
                    {p.name}
                  </h3>

                  <div className="mt-1">
                    {p.discountPrice ? (
                      <>
                        <span className="text-red-600 font-bold mr-2">
                          ₹{p.discountPrice}
                        </span>
                        <span className="line-through text-gray-400 text-sm">
                          ₹{p.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-red-600 font-bold">
                        ₹{p.price}
                      </span>
                    )}
                  </div>

                  {!p.inStock && (
                    <p className="text-xs text-red-500 mt-1">
                      Out of stock
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
