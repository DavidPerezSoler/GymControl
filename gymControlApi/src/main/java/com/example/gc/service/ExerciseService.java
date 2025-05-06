package com.example.gc.service;

import org.springframework.stereotype.Service;
import com.example.gc.dao.ExerciseDAO;
import com.example.gc.entities.Exercise;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseService {

    private final ExerciseDAO ExerciseDAO;

    public ExerciseService(ExerciseDAO ExerciseDAO) {
        this.ExerciseDAO = ExerciseDAO;
    }

    public List<Exercise> getAll() {
        return ExerciseDAO.findAll();
    }

    public Optional<Exercise> getById(String id) {
        return ExerciseDAO.findById(id);
    }

    public Exercise create(Exercise Exercise) {
        return ExerciseDAO.save(Exercise);
    }

    public Optional<Exercise> update(String id, Exercise Exercise) {
        return ExerciseDAO.findById(id)
            .map(existing -> {
                Exercise.setId(id);
                return ExerciseDAO.save(Exercise);
            });
    }

    public void delete(String id) {
        ExerciseDAO.deleteById(id);
    }

    public List<Exercise> getByCategory(String category) {
        return ExerciseDAO.findByCategory(category);
    }
}
