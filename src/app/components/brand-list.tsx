'use client'

import { suspendBrand, reactivateBrand } from '@/app/actions/owner'
import type { Brand } from '@/lib/types'

export function BrandList({ brands }: { brands: (Brand & { drop_count: number })[] }) {
  if (brands.length === 0) {
    return <p className="text-sm text-muted">No brands registered yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted">
            <th className="pb-3 pr-4">Brand</th>
            <th className="pb-3 pr-4">Slug</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Drops</th>
            <th className="pb-3 pr-4">Joined</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id} className="border-b border-border/50">
              <td className="py-3 pr-4 font-medium">{brand.name}</td>
              <td className="py-3 pr-4 font-mono text-gold text-xs">/{brand.slug}</td>
              <td className="py-3 pr-4">
                <span
                  className={`text-xs font-medium uppercase ${
                    brand.subscription_status === 'active'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {brand.subscription_status}
                </span>
              </td>
              <td className="py-3 pr-4">{brand.drop_count}</td>
              <td className="py-3 pr-4 text-muted text-xs">
                {new Date(brand.created_at).toLocaleDateString()}
              </td>
              <td className="py-3">
                {!brand.is_owner && (
                  brand.subscription_status === 'active' ? (
                    <button
                      onClick={() => suspendBrand(brand.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => reactivateBrand(brand.id)}
                      className="text-xs text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                    >
                      Reactivate
                    </button>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
