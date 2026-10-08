import { Schema, model, models, type Model } from "mongoose";

export type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUNDED";

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestEmail: String,
    guestPhone: String,

    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        variantKey: String,
        snapshot: {
          name: { type: String, required: true },
          slug: String,
          image: String,
          sku: String,
          brand: String,
          category: String,
          attributes: Schema.Types.Mixed,
        },
        price: {
          original: { type: Number, required: true },
          sale: { type: Number, required: true },
        },
        quantity: { type: Number, required: true, min: 1 },
        total: { type: Number, required: true },
      },
    ],

    pricing: {
      subtotal: { type: Number, required: true },
      itemDiscount: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      campaignDiscount: { type: Number, default: 0 },
      deliveryCharge: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: "BDT" },
    },

    coupon: {
      couponId: { type: Schema.Types.ObjectId, ref: "Coupon" },
      code: String,
      type: { type: String, enum: ["PERCENTAGE", "FIXED", "FREE_SHIPPING"] },
      value: Number,
      discountAmount: Number,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "AWAITING_PAYMENT",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "READY_TO_SHIP",
        "SHIPPED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    shipping: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: { type: String, required: true },
      area: String,
      city: String,
      postcode: String,
      division: String,
      landmark: String,
    },

    delivery: {
      type: {
        type: String,
        enum: ["INSIDE_DHAKA", "OUTSIDE_DHAKA"],
        required: true,
      },
    },

    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    meta: {
      ip: String,
      userAgent: String,
      device: String,
      platform: String,
    },

    /**
     * Server-side analytics bookkeeping (Meta Conversions API).
     * Never contains the CAPI access token or any customer PII beyond what
     * the order already stores.
     */
    analytics: {
      meta: {
        eventId: { type: String, index: true },
        capiStatus: {
          type: String,
          enum: ["pending", "success", "failed"],
          default: "pending",
        },
        capiAttempts: { type: Number, default: 0 },
        lastCapiAttemptAt: Date,
        capiError: String,
        fbc: String,
        fbp: String,
      },
    },

    notifications: {
      sms: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

export const OrderModel: Model<Record<string, unknown>> =
  models.Order || model("Order", OrderSchema);
