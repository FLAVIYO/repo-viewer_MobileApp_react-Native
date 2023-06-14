import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const App = () => {
  const [repositoriesWithCommits, setRepositoriesWithCommits] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState(null);

  useEffect(() => {
    fetchRepositoriesWithCommits(); // Fetch a minimum of 5 repositories initially
  }, []);

  // Fetch repositories with commits from GitHub
  const fetchRepositoriesWithCommits = async () => {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: 'Bearer ADD YOUR ACCESS_TOKEN',
        },
      });
      const repositories = await response.json();

      const repositoriesWithCommits = await Promise.all(
        repositories.map(async (repo) => {
          try {
            const commitsResponse = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`, {
              headers: {
                Authorization: 'Bearer ADD YOUR ACCESS_TOKEN',
              },
            });
            const commits = await commitsResponse.json();
            return {
              ...repo,
              commits,
            };
          } catch (error) {
            console.error(`Error fetching commits for repository: ${repo.name}`);
            return {
              ...repo,
              commits: [],
            };
          }
        })
      );

      setRepositoriesWithCommits(repositoriesWithCommits);
      setSearchResult(repositoriesWithCommits);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Render repositories in the UI
  const renderRepositories = () => {
    if (searchResult.length === 0) {
      return <Text style={styles.noRepositoriesText}>No repositories found.</Text>;
    }

    return searchResult.map((repo) => (
      <TouchableOpacity
        key={repo.name}
        style={styles.repositoryCard}
        onPress={() => showRepositoryDetails(repo.owner.login, repo.name)}
      >
        <Text style={styles.repositoryName}>{repo.name}</Text>
        <Text style={styles.repositoryOwner}>Owner: {repo.owner.login}</Text>
        <Text style={styles.repositoryDescription}>{repo.description || 'No description provided.'}</Text>
      </TouchableOpacity>
    ));
  };

  // Render commits in the UI
  const renderCommits = (commits) => {
    if (commits.length === 0) {
      return <Text style={styles.noCommitsText}>No commits found.</Text>;
    }

    return commits.map((commit) => (
      <Text key={commit.sha} style={styles.commitItem}>
        Hash: {commit.sha}, Message: {commit.commit.message}, Date: {commit.commit.author.date}, Author: {commit.commit.author.name}
      </Text>
    ));
  };

  // Show repository details and fetch commits
  const showRepositoryDetails = async (owner, repo) => {
    try {
      const repository = repositoriesWithCommits.find((r) => r.owner.login === owner && r.name === repo);
      if (repository) {
        setSelectedRepository(repository);
        setModalVisible(true);
      } else {
        console.error('Repository not found:', owner, repo);
      }
    } catch (error) {
      console.error('Error showing repository details:', error);
      setSelectedRepository(null);
      setModalVisible(true);
    }
  };

  // Filter repositories based on search input
  const handleSearchInput = (searchTerm) => {
    const filteredRepositories = repositoriesWithCommits.filter((repo) => {
      const nameMatch = repo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || descriptionMatch;
    });
    setSearchResult(filteredRepositories);
  };

  // Close the repository details modal
  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>GitHub Repositories</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search repositories"
        onChangeText={handleSearchInput}
      />

      <ScrollView style={styles.repositoriesList}>{renderRepositories()}</ScrollView>

      {selectedRepository && (
        <Modal visible={modalVisible} animationType="fade">
          <View style={styles.repositoryDetailsModal}>
            <Text style={styles.modalHeading}>{selectedRepository.name}</Text>
            <Text style={styles.modalText}>Owner: {selectedRepository.owner.login}</Text>
            <Text style={styles.modalText}>Description: {selectedRepository.description || 'No description provided.'}</Text>
            <Text style={styles.modalHeading}>Last 10 Commits:</Text>
            <ScrollView style={styles.commitsList}>{renderCommits(selectedRepository.commits)}</ScrollView>
            <Button title="Close" onPress={closeModal} />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7FAFC',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  repositoriesList: {
    flex: 1,
    marginBottom: 16,
  },
  repositoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  repositoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textDecorationLine: 'none',
    color: '#1F2937',
  },
  repositoryOwner: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  repositoryDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  noRepositoriesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  repositoryDetailsModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop :50,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  modalText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  commitsList: {
    marginBottom: 8,
  },
  commitItem: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  noCommitsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default App;





