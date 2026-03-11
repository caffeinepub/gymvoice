import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, type Review } from "../backend";
import { useActor } from "./useActor";

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      author,
      rating,
      category,
      opinion,
    }: {
      author: string;
      rating: number;
      category: Category;
      opinion: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitReview(author, rating, category, opinion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export { Category };
