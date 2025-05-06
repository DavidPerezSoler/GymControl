package com.example.gc.dao;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Repository;

import com.example.gc.entities.Exercise;

import java.util.List;
import java.util.Optional;

@Repository
public class ExerciseDAOImpl implements ExerciseDAO {

    private final MongoTemplate mongoTemplate;

    public ExerciseDAOImpl(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public List<Exercise> findAll() {
        return mongoTemplate.findAll(Exercise.class);
    }

    @Override
    public Optional<Exercise> findById(String id) {
        Exercise Exercise = mongoTemplate.findById(id, Exercise.class);
        return Optional.ofNullable(Exercise);
    }

    @Override
    public Exercise save(Exercise Exercise) {
        return mongoTemplate.save(Exercise);
    }

    @Override
    public void deleteById(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        mongoTemplate.remove(query, Exercise.class);
    }

    @Override
    public List<Exercise> findByCategory(String category) {
        Query query = new Query(Criteria.where("category").is(category));
        return mongoTemplate.find(query, Exercise.class);
    }
}