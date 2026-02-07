import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroBanner({ hero }: { hero: any }) {
  if (!hero) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            {hero.title}
          </h1>
          <p className="text-lg text-primary font-semibold">
            {hero.subtitle}
          </p>
          <p className="text-lg text-muted-foreground">
            {hero.description}
          </p>

          <div className="flex gap-4">
            <Link href={hero.primaryCtaLink || "/shop"}>
              <Button size="lg">
                {hero.primaryCtaText}
              </Button>
            </Link>
            <Link href={hero.secondaryCtaLink || "/about"}>
              <Button size="lg" variant="outline">
                {hero.secondaryCtaText}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative h-96 rounded-lg overflow-hidden">
          {hero.image && (
            <Image
              src={`https:${hero.image.fields.file.url}`}
              alt={hero.title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
      </div>
    </section>
  )
}
