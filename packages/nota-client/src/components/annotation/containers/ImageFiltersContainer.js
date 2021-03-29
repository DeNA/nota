import { connect } from "react-redux";
import ImageFilters from "../ImageFilters";
import { changeImageFilters } from "../../../actions";

const mapStateToProps = state => {
  return {
    filters: state.imageFilters
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeFilters: filters => {
      dispatch(changeImageFilters(filters));
    }
  };
};

const ImageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageFilters);
export default ImageContainer;
