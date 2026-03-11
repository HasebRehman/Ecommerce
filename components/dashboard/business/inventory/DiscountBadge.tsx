interface Props {
  price:         number
  discountPrice: number | null
}

export default function DiscountBadge({ price, discountPrice }: Props) {
  if (!discountPrice || discountPrice >= price) return null

  const percent = Math.round(((price - discountPrice) / price) * 100)

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white">
      -{percent}% OFF
    </span>
  )
}