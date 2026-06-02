// SortFilterBar.jsx
export default function SortFilterBar({ onPriceChange }) {
  const handlePriceChange = (e) => {
    const selected = e.target.value;
    if (onPriceChange) {
      onPriceChange(selected); // ✅ trigger parent filter
    }
  };

  return (
    <div className="w-full px-5 mt-6">
      <div className="max-w-screen-xl mx-auto flex flex-wrap justify-center items-center gap-x-5 gap-y-3 text-sm">
        {/* Sort By */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            className="bg-gray-100 border border-gray-300 rounded px-2 py-1"
          >
            <option>Popularity</option>
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="bg-gray-100 border border-gray-300 rounded px-2 py-1"
          >
            <option>Any</option>
          </select>
        </div>

        {/* ✅ Price */}
        <div>
          <select
            id="price"
            className="bg-gray-100 border border-gray-300 rounded px-2 py-1"
            defaultValue="Any"
            onChange={handlePriceChange} // 👈 crucial
          >
            <option disabled>Price</option>
            <option value="Any">Any</option>
            <option value="Under ₹500">Under ₹500</option>
            <option value="₹500–1000">₹500–1000</option>
            <option value="₹1000+">₹1000+</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <select
            id="rating"
            className="bg-gray-100 border border-gray-300 rounded px-2 py-1"
          >
            <option disabled selected>
              Rating
            </option>
            <option>1★ & above</option>
            <option>2★ & above</option>
            <option>3★ & above</option>
            <option>4★ & above</option>
          </select>
        </div>
      </div>
    </div>
  );
}
