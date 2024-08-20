import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Products.css";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

const Products: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const productsPerPage = 9;
  const currentPage = parseInt(page || "1", 10);

  //Prevent the late loading images to break the grid layout
  const preloadImages = (imageUrls: string[]): Promise<void[]> => {
    const imagePromises = imageUrls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = () => resolve();
          img.onerror = () => reject();
        })
    );
    return Promise.all(imagePromises);
  };

  //Pagination since there are a lot of products
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    navigate(`/products/${newPage}`);
  };

  //Prevent the grid layout on the last page from breaking with placeholders
  const placeholders = Array(productsPerPage - products.length).fill(null);

  useEffect(() => {
    const fetchProducts = async () => {
      //Loading spinner until the products are fetched
      setLoading(true);
      try {
        const response = await fetch(
          `https://dummyjson.com/products?limit=${productsPerPage}&skip=${
            (currentPage - 1) * productsPerPage
          }`
        );
        const data = await response.json();
        setProducts(data.products);
        setTotalProducts(data.total);

        const imageUrls = data.products.map(
          (product: Product) => product.thumbnail
        );
        await preloadImages(imageUrls);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  return (
    <div className="Container">
      {loading || !imagesLoaded ? (
        <LoadingSpinner />
      ) : (
        <>
          <h1>Products</h1>
          <h2>Enjoy the quality products chosen for you!</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-thumbnail-wrapper">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="product-thumbnail"
                  />
                </div>
                <h3>{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">${product.price.toFixed(2)}</p>
              </div>
            ))}
            {placeholders.map((_, index) => (
              <div
                className="product-card placeholder"
                key={`placeholder-${index}`}
              />
            ))}
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
