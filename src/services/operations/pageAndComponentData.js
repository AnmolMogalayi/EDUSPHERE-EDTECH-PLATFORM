import {toast} from "react-hot-toast"
import { setProgress } from "../../slices/loadingBarSlice";
import { apiConnector } from '../apiConnector';
import { catalogData } from '../apis';

export const getCatalogaPageData = async(categoryId,dispatch, pathname = "") => {
  // const toastId = toast.loading("Loading...");
  dispatch(setProgress(50));
  let result = [];
  try{
        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API, 
        {categoryId: categoryId,});
        console.log("CATALOG PAGE DATA API RESPONSE....", response);
        if(!response.data.success)
            throw new Error("Could not Fetch Category page data error",
            response);

         result = response?.data;

  }
  catch(error) {
    console.log("CATALOG PAGE DATA API ERROR....", error);
    if (error.response?.status === 404 && pathname.includes('/catalog')) {
      toast.error("No courses available in this category yet. Please check back later!");
    } else if (!pathname.includes('/catalog')) {
      // Do not show the toast on non-catalog pages
    } else {
      toast.error("Something went wrong. Please try again later.");
    }
    result = error.response?.data;
  }
  // toast.dismiss(toastId);
  dispatch(setProgress(100));
  return result;
}

