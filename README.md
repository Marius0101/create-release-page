# :rocket: create-pull-request

A simple GitHub Action to automate the creation of pull requests. \
It also supports assigning users and requesting reviews from individuals or teams.

## :sparkles: Features
- :white_check_mark: Create a pull request
- :bust_in_silhouette: Assign users
- :eyes: Request reviews from users or teams 

## :package: Usage
See the [action.yml](https://github.com/Marius0101/create-pull-request/blob/develop/action.yml) file for detailed input options.

### :white_check_mark: Basic Setup
```yaml
- uses:  Marius0101/create-pull-request@develop
  with:
    token: ''       # GitHub access token
    title: ''       # Title of the pull request
    head: ''        # Source branch (e.g. 'feature/new-feature')
    base: ''        # Target branch (e.g. 'main' or 'develop')
```
### :test_tube: Example
```yaml
    uses:  Marius0101/create-pull-request@develop
    with:
        token: ${{ secrets.GITHUB_TOKEN }}
        title: 'Add new feature' 
        head: 'feature/new-feature' 
        base: 'develop' 
```
### :gear: Optional Parameters

#### `body`
Description for the pull request. Supports Markdown.

```yaml
with:
    body: |
        This is a body description.
        - It supports **Markdown**
```

#### `assignees`
Assign users to the pull request.
- You can specify up to 10 users.
- Accepts space-separated or multiline format.
```yaml
with:
    assignees: user1 user2 user3
```
```yaml
with:
    assignees: |
    user1
    user2
    user3
```
#### `user_reviewers`
Request reviews from individual users.\
:warning: If a user does not have access to the repository, the action will not fail.
```yaml
with:
    user_reviewers: user1 user2 user3
```
```yaml
with:
    user_reviewers: |
    user1
    user2
    user3
```

#### `team_reviewers`
Request reviews from GitHub teams. \
:warning: If a team does not have access to the repository, the action will not fail.
```yaml
with:
    team_reviewers: team1 team2 team3
```
```yaml
with:
    team_reviewers: |
    team1
    team2
    team3
```
### :outbox_tray: Output Parameter
#### `pr_number`
Returns the number of the pull request created.
```yaml
    #Example usage
    - uses:  Marius0101/create-pull-request@develop
      id: create-pull-request
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        title: 'Add new feature' 
        head: 'feature/new-feature' 
        base: 'develop' 
    - run: |
        echo "Pull request number: ${{ steps.create-pull-request.outputs.pr_number }}""
```
