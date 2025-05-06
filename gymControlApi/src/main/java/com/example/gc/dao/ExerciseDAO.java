package com.example.gc.dao;

import java.util.List;
import java.util.Optional;

import com.example.gc.entities.Exercise;

public interface ExerciseDAO {

	List<Exercise> findAll();

	Optional<Exercise> findById(String id);

	Exercise save(Exercise Exercise);

	void deleteById(String id);

	List<Exercise> findByCategory(String category);

}
