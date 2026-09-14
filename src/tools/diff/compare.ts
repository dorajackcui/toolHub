export interface DiffLine {
  left: string;
  right: string;
  type: "equal" | "modified" | "added" | "removed";
  lineNumber: number;
}

export interface CharDiff {
  text: string;
  type: "equal" | "added" | "removed";
}

// Compute character-level diff using LCS algorithm
export function computeCharDiff(
  str1: string,
  str2: string,
): { left: CharDiff[]; right: CharDiff[] } {
  if (str1 === str2) {
    return {
      left: [{ text: str1, type: "equal" }],
      right: [{ text: str2, type: "equal" }],
    };
  }

  // Character-level LCS for accurate diff
  const chars1 = [...str1];
  const chars2 = [...str2];
  const m = chars1.length;
  const n = chars2.length;

  // Build LCS table
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (chars1[i - 1] === chars2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find the LCS and build diff
  const leftTemp: CharDiff[] = [];
  const rightTemp: CharDiff[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && chars1[i - 1] === chars2[j - 1]) {
      // Common character
      leftTemp.unshift({ text: chars1[i - 1], type: "equal" });
      rightTemp.unshift({ text: chars2[j - 1], type: "equal" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Character only in str2 (added)
      rightTemp.unshift({ text: chars2[j - 1], type: "added" });
      j--;
    } else if (i > 0) {
      // Character only in str1 (removed)
      leftTemp.unshift({ text: chars1[i - 1], type: "removed" });
      i--;
    }
  }

  // Merge consecutive same-type diffs
  function mergeDiffs(diffs: CharDiff[]): CharDiff[] {
    const merged: CharDiff[] = [];
    for (const diff of diffs) {
      if (merged.length > 0 && merged[merged.length - 1].type === diff.type) {
        merged[merged.length - 1].text += diff.text;
      } else if (diff.text) {
        merged.push({ ...diff });
      }
    }
    return merged;
  }

  return {
    left: mergeDiffs(leftTemp),
    right: mergeDiffs(rightTemp),
  };
}

export function computeSideBySideDiff(
  text1: string,
  text2: string,
): DiffLine[] {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  const results: DiffLine[] = [];
  const maxLen = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLen; i++) {
    const line1 = lines1[i] ?? "";
    const line2 = lines2[i] ?? "";

    let type: DiffLine["type"];
    if (i >= lines1.length) {
      type = "added";
    } else if (i >= lines2.length) {
      type = "removed";
    } else if (line1 === line2) {
      type = "equal";
    } else {
      type = "modified";
    }

    results.push({
      left: lines1[i] ?? "",
      right: lines2[i] ?? "",
      type,
      lineNumber: i + 1,
    });
  }

  return results;
}
