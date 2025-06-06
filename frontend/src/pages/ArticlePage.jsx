import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import PostHeader from "../components/PostHeader";
import PostContent from "../components/PostContent";
import PostFooter from "../components/PostFooter";
import Performan from "@/components/PopularComp";
import Recentcomment from "@/components/RecentComp";
import Advertisement from "@/components/Advertisement";
import apiClient from "@/services/apiClient";

// Simple CSS Spinner
const Spinner = () => (
  <div className="flex justify-center items-center h-[500px]">
    <div className="spinner border-4 border-t-4 border-gray-500 border-t-transparent w-16 h-16 rounded-full animate-spin"></div>
  </div>
);

const ArticlePage = () => {
  const { id } = useParams(); 
  const [postData, setPostData] = useState(null); 
  const [likes, setLikes] = useState(0);  
  const [likedByUser, setLikedByUser] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(""); 

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('dsakj');
        
        const response = await apiClient.get(`/posts/post/${id}`);
        setPostData(response.data);
        setLikes(response.data.likes);  

        const token = localStorage.getItem("token");
        if (token) {
          console.log(postData);
          
          const likedResponse = await apiClient.get(`/posts/liked/${response?.data?._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLikedByUser(likedResponse.data.isLiked);  
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage("Unauthorized. Please log in to like this post.");
        return;
      }

      const url = likedByUser 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/posts/dislike/${postData?._id}` 
        : `${import.meta.env.VITE_BACKEND_URL}/api/posts/like/${postData?._id}`; 

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.put(url, {}, { headers });

      if (response.status === 200) {
        setLikes(prevLikes => likedByUser ? prevLikes - 1 : prevLikes + 1);
        setLikedByUser(!likedByUser); 
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Unauthorized. Please log in to like this post.");
      } else {
        console.error("Error liking/disliking post:", error);
      }
    }
  };

  if (!postData) {
    return <Spinner />; 
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center items-start">
      <div className="w-full p-2 lg:w-[70%] lg:ml-[10%] overflow-x-hidden">
        <PostHeader 
          category={postData.category.name}
          title={postData.title} 
          introDescription={postData.introDescription} 
          publishDate={postData.createdAt} 
        />
        <PostContent content={postData.content} />
        
        {errorMessage && (
          <div className="text-black mt-2">
            {errorMessage}
          </div>
        )}

        <PostFooter 
          likes={likes} 
          views={postData.views} 
          tags={postData.tags} 
          previousArticle={postData.previousArticle} 
          nextArticle={postData.nextArticle} 
          author={postData?.userId[0]?.username || "Admin"} 
          authorLink={postData.authorLink} 
          authorDes={postData.authorDes} 
          handleLike={handleLike}
          isLiked={likedByUser}  
        />
      </div>
      
      <div className="w-full flex lg:w-[30%] lg:mr-[10%] flex-col justify-center items-center lg:sticky lg:top-0">
        <Advertisement /> 
        <Performan /> 
        <Recentcomment /> 
      </div>
    </div>
  );
};

export default ArticlePage;
