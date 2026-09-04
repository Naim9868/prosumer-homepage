# Schema change required

This is the *only* schema-level change. Find `ProductImageGroupSchema` in your
existing Product model file and update just the `enum` array — everything
else about the schema stays exactly as it is:

```ts
const ProductImageGroupSchema = new Schema({
  type: {
    type: String,
    enum: [
      "primary",
      "product",
      "detail",
      "diagram",
      "package",
      "contents",
      "lifestyle",
      "usage",
      "scale",
      "dimensions",
      "features",
      "infographic",
      "comparison",
      "result",
      "installation",
      "instruction",
      "cover",
      "gallery",
      "variant",
    ],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  images: [ProductImageSchema],
}, { _id: false });
```

If your enum currently has fewer values, just add the missing ones — don't
reorder or remove anything already there so existing documents stay valid.

Note: `"comparison"` is listed in the schema enum for completeness, but in
this implementation the comparison UI (`ComparisonSection`) is driven by
`specificationGroups`, not by an image group — see the note in the
integration guide about how comparison data is detected.
