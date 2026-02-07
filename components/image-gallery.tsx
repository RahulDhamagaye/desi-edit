"use client"

import Image from "next/image"
import { useState } from "react"

interface ImageGalleryProps {
  images: string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-muted rounded-lg h-96 md:h-full overflow-hidden">
        <Image
          src={images[selectedImage] || "/placeholder.svg?height=500&width=400"}
          alt={`${productName} - Image ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                selectedImage === idx ? "border-primary" : "border-border hover:border-muted-foreground"
              }`}
            >
              <Image src={image || "/placeholder.svg"} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
