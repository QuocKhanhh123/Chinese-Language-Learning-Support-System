import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../network/httpRequest";

export const orderApi = {
  createOrder: (classId) =>
    axiosInstance.post("/orders/create", { classId }).then((r) => r.data),
  getMyOrders: () =>
    axiosInstance.get("/orders/my-orders").then((r) => r.data.data),
  verifyZaloPayPayment: ({ appTransId, orderId }) =>
    axiosInstance
      .get("/orders/zalopay/verify", {
        params: {
          ...(appTransId ? { appTransId } : {}),
          ...(orderId ? { orderId } : {}),
        },
      })
      .then((r) => r.data.data),
};

export const useMyOrders = () =>
  useQuery({
    queryKey: ["orders", "mine"],
    queryFn: orderApi.getMyOrders,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (data) => {
      // Nếu miễn phí (paid ngay), refresh luôn
      if (data?.data?.status === "paid") {
        qc.invalidateQueries({ queryKey: ["classes", "my-classes"] });
        qc.invalidateQueries({ queryKey: ["orders"] });
      }
      // Nếu ZaloPay: user sẽ redirect sang ZaloPay rồi quay về PaymentResultPage
      // → invalidate sẽ được gọi ở useVerifyZaloPayPayment khi xác nhận paid
    },
  });
};

export const useVerifyZaloPayPayment = ({ appTransId, orderId, enabled = true }) => {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ["orders", "zalopay", "verify", appTransId || null, orderId || null],
    queryFn: () => orderApi.verifyZaloPayPayment({ appTransId, orderId }),
    enabled: enabled && Boolean(appTransId || orderId),
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => {
      if (data?.status === "paid") {
        qc.invalidateQueries({ queryKey: ["classes", "my-classes"] });
        qc.invalidateQueries({ queryKey: ["orders"] });
      }
      return data;
    },
  });
};
