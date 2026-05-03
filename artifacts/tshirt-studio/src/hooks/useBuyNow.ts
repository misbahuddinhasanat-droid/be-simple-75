import { useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useBuyNow() {
  const addCartItem = useAddCartItem();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const buyNow = (productId: number, size: string, color = "Black", quantity = 1) => {
    addCartItem.mutate(
      { data: { productId, size, color, quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setLocation("/checkout");
        },
        onError: () => {
          toast({
            title: "Something went wrong",
            description: "Could not process. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return { buyNow, isPending: addCartItem.isPending };
}
