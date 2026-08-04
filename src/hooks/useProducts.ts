import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductWithStats, Profile, Review } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<ProductWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(*)')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setProducts([]);
      setLoading(false);
      return;
    }

    const productIds = (data ?? []).map((p) => p.id);
    let reviewStats: Record<string, { count: number; avg: number }> = {};
    if (productIds.length) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .in('product_id', productIds);
      if (reviews) {
        const map: Record<string, { sum: number; count: number }> = {};
        for (const r of reviews) {
          if (!map[r.product_id]) map[r.product_id] = { sum: 0, count: 0 };
          map[r.product_id].sum += r.rating;
          map[r.product_id].count += 1;
        }
        for (const [pid, v] of Object.entries(map)) {
          reviewStats[pid] = { count: v.count, avg: v.sum / v.count };
        }
      }
    }

    const enriched = (data ?? []).map((p) => {
      const stats = reviewStats[p.id];
      return {
        ...(p as Product),
        seller: p.seller as unknown as Profile,
        review_count: stats?.count ?? 0,
        avg_rating: stats?.avg ?? 0,
      };
    });
    setProducts(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export async function fetchProduct(id: string): Promise<ProductWithStats | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, seller:profiles!seller_id(*)')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', id);
  const count = reviews?.length ?? 0;
  const avg = count ? reviews!.reduce((s, r) => s + r.rating, 0) / count : 0;

  return {
    ...(data as Product),
    seller: data.seller as unknown as Profile,
    review_count: count,
    avg_rating: avg,
  };
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(*)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  return (data ?? []).map((r) => ({ ...r, reviewer: r.reviewer as unknown as Profile }));
}

export async function fetchMyProducts(sellerId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Product[];
}

export async function createProduct(
  sellerId: string,
  input: Omit<Product, 'id' | 'seller_id' | 'created_at' | 'is_flagged'>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').insert({
    ...input,
    seller_id: sellerId,
  });
  return { error: error?.message ?? null };
}

export async function updateProduct(
  id: string,
  input: Partial<Product>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').update(input).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function createReview(
  productId: string,
  reviewerId: string,
  rating: number,
  comment: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    reviewer_id: reviewerId,
    rating,
    comment,
  });
  return { error: error?.message ?? null };
}

export async function fetchStats() {
  const [{ count: userCount }, { count: productCount }, { count: flaggedCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
  ]);

  const { data: catData } = await supabase.from('products').select('category');
  const catMap: Record<string, number> = {};
  for (const row of catData ?? []) {
    catMap[row.category] = (catMap[row.category] ?? 0) + 1;
  }

  return {
    userCount: userCount ?? 0,
    productCount: productCount ?? 0,
    flaggedCount: flaggedCount ?? 0,
    categoryCounts: catMap,
  };
}
