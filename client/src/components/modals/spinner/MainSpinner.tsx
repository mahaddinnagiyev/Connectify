import { Comment } from "react-loader-spinner";
import "./main-spinner.css";

const MainSpinner = () => {
  return (
    <>
      <section id="main-spinner">
        <div>
          <Comment
            visible={true}
            height="80"
            width="80"
            ariaLabel="comment-loading"
            wrapperStyle={{}}
            wrapperClass="comment-wrapper"
            color="#fff"
            backgroundColor="#00ff00"
          />
        </div>
        <div><b>Loading...</b></div>
      </section>
    </>
  );
};

export default MainSpinner;
