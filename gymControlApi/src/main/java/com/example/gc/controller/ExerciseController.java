package com.example.gc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gc.entities.Exercise;
import com.example.gc.service.ExerciseService;

import java.util.List;

@RestController
@RequestMapping("/api/Exercises")
public class ExerciseController {

    private final ExerciseService service;

    public ExerciseController(ExerciseService service) {
        this.service = service;
    }

    @GetMapping
    public List<Exercise> listAll(@RequestParam(required = false) String category) {
        if (category != null) {
            return service.getByCategory(category);
        }
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getById(@PathVariable String id) {
        return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Exercise> create(@RequestBody Exercise Exercise) {
        Exercise creado = service.create(Exercise);
        return ResponseEntity.status(201).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> update(@PathVariable String id,
                                            @RequestBody Exercise Exercise) {
        return service.update(id, Exercise)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}