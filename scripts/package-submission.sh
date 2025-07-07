#!/usr/bin/env bash

# Check if the candidate email has been provided
CANDIDATE_SUBMISSION=${1}
if [ -z "${CANDIDATE_SUBMISSION}" ] ; then
  echo "This script is expected to be run as part of the submission process. Please refer to README.md for instructions."
  exit 1
fi

# Check that the working directory is clean.
if [ -n "$(git status -s)" ] ; then
  echo "You appear to have files that have not been committed."
  echo 
  echo "Please commit any files you need & remove or stash the rest. Then try again."
  exit 1
fi

# Check that they are 100% sure about the submission.
echo "You only get one chance to make a submission. Please make 100% sure you are happy with what's about to be sent to us."
echo
read -p "Are you sure you want to make this submission? (yes/no) " r
case $r in
  yes ) echo "Making a submission ..." ;;
  no ) echo "No submission will be made." ; exit 1 ;;
  * ) echo "Because you didn't explicitly say 'yes' we won't make a submission." ; exit 1 ;;
esac

# We'll use a stash just to make sure.
s=$(git stash create)
git archive \
  --format=zip \
  --worktree-attributes \
  --output ${CANDIDATE_SUBMISSION} ${s:-HEAD}
