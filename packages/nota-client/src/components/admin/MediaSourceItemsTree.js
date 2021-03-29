import React from "react";
import DirectoryTree from "./DirectoryTree";
import { fetchMediaItemsTree } from "../../lib/api";

const MediaSourceItemsTree = function({
  projectId,
  mediaSourceId,
  selectedPath,
  selectPath
}) {
  const [tree, setTree] = React.useState(null);

  const handleGetBranch = async function(path) {
    let currentTree = tree;
    if (!currentTree) {
      currentTree = await fetchMediaItemsTree({
        projectId: projectId,
        mediaSourceId: mediaSourceId
      });
      setTree(currentTree);
    }

    const currentBranch = currentTree.find(branch => branch.path === path);

    const subBranches = currentTree.filter(branch => {
      const root = `${path}/`;
      return (
        branch.path.startsWith(root) &&
        !branch.path.replace(root, "").includes("/")
      );
    });

    return [
      subBranches.map(branch => ({
        name: branch.path.replace(`${path}/`, ""),
        isOpen: false,
        dirs: []
      })),
      currentBranch ? currentBranch.files : 0
    ];
  };

  return (
    <DirectoryTree
      getBranch={handleGetBranch}
      selectPath={selectPath}
      selectedPath={selectedPath}
    />
  );
};

export default MediaSourceItemsTree;
