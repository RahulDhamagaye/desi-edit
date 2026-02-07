"use client"

import Link from "next/link"
import Image from "next/image"
import { Check, X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    image: string
    color?: string
  }
}

export function AddToCartModal({ isOpen, onClose, product }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-sm overflow-hidden">
        {/* Success Header */}
        <div className="bg-emerald-50 px-6 py-4 flex items-center justify-between border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <Check className="h-5 w-5" />
            <span>Added to cart</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Content */}
        <div className="p-8 flex flex-col md:flex-row gap-6">
          <div className="relative h-48 w-48 mx-auto md:mx-0 border border-gray-100">
            <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
          </div>
          <div className="flex-1 text-center md:text-left pt-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
            {product.color && (
               <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                 <div className="w-4 h-4 rounded-full bg-gray-400 shadow-inner" />
                 <span>{product.color}</span>
               </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-col md:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-3 border border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            Keep Shopping
          </button>
          <Link
            href="/cart"
            className="px-8 py-3 bg-[#2D2D2D] text-white rounded-full font-medium text-center hover:bg-black transition-colors"
          >
            Go to cart
          </Link>
        </div>
      </div>
    </div>
  )
}