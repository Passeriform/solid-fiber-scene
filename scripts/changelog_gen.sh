#!/bin/bash

# Accept a tag as an argument
NEW_TAG=$1

echo -e "Released $NEW_TAG 🚀\n"

echo "# Changelog 🗒"

declare -A commits
declare -A special_commits

# Get the latest tag before the provided one
if git rev-parse "$NEW_TAG" >/dev/null 2>&1; then
    PREVIOUS_TAG=$(git describe --tags --abbrev=0 --exclude="$NEW_TAG" 2>/dev/null)
else
    NEW_TAG="HEAD"
    PREVIOUS_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
fi

# Determine log range
if [ -z "$PREVIOUS_TAG" ]; then
    LOG_RANGE="$NEW_TAG"
else
    LOG_RANGE="$PREVIOUS_TAG..$NEW_TAG"
fi

# Get commit messages from the last tagged release or all commits if no tag exists
while IFS= read -r line; do
    if [[ $line =~ ^\[([^]]+)\]\ (.*)$ ]]; then
        category="${BASH_REMATCH[1]}"
        message="${BASH_REMATCH[2]}"

        # Skip unwanted categories
        case "$category" in
            "Debug"|"Lint"|"Meta"|"CI"|"CD"|"CI/CD")
                continue
                ;;
        esac

        # Separate special categories
        case "$category" in
            "Utility"|"Tool")
                special_commits["$category"]+="\n- $message"
                ;;
            *)
                commits["$category"]+="\n- $message"
                ;;
        esac
    fi
done < <(git log $LOG_RANGE --pretty=format:"%s")

# Output categorized commits
for category in "${!commits[@]}"; do
    echo -e "\n## $category"
    echo -e "${commits[$category]}"
done

# Output special categories at the end
if [[ ${#special_commits[@]} -gt 0 ]]; then
    echo -e "\n## Miscellaneous"
    for category in "${!special_commits[@]}"; do
        echo -e "\n### $category"
        echo -e "${special_commits[$category]}"
    done
fi
