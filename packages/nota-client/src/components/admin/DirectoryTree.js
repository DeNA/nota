import React from "react";
import Icon from "../Icon";
import Loading from "../Loading";
import "./DirectoryTree.css";

export const DirectoryTreeItem = function({
  tree,
  selectedPath,
  currentPath,
  open,
  selectPath
}) {
  const item = tree[currentPath];
  const handleSelectPath = () => {
    if (!item.isOpen) {
      open(currentPath);
    }
    selectPath(currentPath);
  };
  const isSelected = selectedPath === currentPath;
  return (
    <div>
      <div
        className={`tree-item mb-1 p-1 rounded ${isSelected && "selected"}`}
        onClick={handleSelectPath}
      >
        <Icon name="folder" />
        <span className="m-2">{item.name}</span>
      </div>
      <div className="ml-3">
        {item.dirs.map(dir => {
          return (
            <DirectoryTreeItem
              key={dir}
              tree={tree}
              selectedPath={selectedPath}
              currentPath={dir}
              open={open}
              selectPath={selectPath}
            />
          );
        })}
      </div>
    </div>
  );
};

const DirectoryTree = function({ getBranch, selectedPath, selectPath }) {
  const [tree, setTree] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const open = async function(paths) {
    setLoading(true);
    const newTree = tree
      ? { ...tree }
      : { "/": { name: "/", dirs: [], isOpen: false } };
    const key = paths;
    const [subdirs, files] = await getBranch(key);
    newTree[key || "/"].dirs = [];
    newTree[key || "/"].files = files;
    newTree[key || "/"].isOpen = true;
    subdirs.forEach(subdir => {
      newTree[key || "/"].dirs.push(key + "/" + subdir.name);
      newTree[key + "/" + subdir.name] = subdir;
    });

    setTree(newTree);
    setLoading(false);
  };
  const handleOpen = React.useRef(open);
  const handleSelectPath = React.useRef(selectPath);
  React.useEffect(() => {
    handleOpen.current("");
    handleSelectPath.current("/");
  }, []);

  return (
    <div>
      {loading && <Loading />}
      {tree ? (
        <DirectoryTreeItem
          tree={tree}
          selectedPath={selectedPath}
          currentPath="/"
          open={open}
          selectPath={selectPath}
        />
      ) : (
        <div>
          <Loading />
        </div>
      )}

      <br />
      <br />
    </div>
  );
};

export default DirectoryTree;
