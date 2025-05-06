package com.example.gc.entities;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "Exercises")
public class Exercise {

	@Id
	private String id;

	private String name;

	private String force;

	private String level;

	private String mechanic;

	private String equipment;

	@Field("primaryMuscles")
	private List<String> primaryMuscles;

	@Field("secondaryMuscles")
	private List<String> secondaryMuscles;

	private List<String> instructions;

	private String category;

	public Exercise() {
	}

	public Exercise(String name, String force, String level, String mechanic, String equipment,
			List<String> primaryMuscles, List<String> secondaryMuscles, List<String> instructions, String category) {
		this.name = name;
		this.force = force;
		this.level = level;
		this.mechanic = mechanic;
		this.equipment = equipment;
		this.primaryMuscles = primaryMuscles;
		this.secondaryMuscles = secondaryMuscles;
		this.instructions = instructions;
		this.category = category;
	}

	// Getters y setters
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getForce() {
		return force;
	}

	public void setForce(String force) {
		this.force = force;
	}

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public String getMechanic() {
		return mechanic;
	}

	public void setMechanic(String mechanic) {
		this.mechanic = mechanic;
	}

	public String getEquipment() {
		return equipment;
	}

	public void setEquipment(String equipment) {
		this.equipment = equipment;
	}

	public List<String> getPrimaryMuscles() {
		return primaryMuscles;
	}

	public void setPrimaryMuscles(List<String> primaryMuscles) {
		this.primaryMuscles = primaryMuscles;
	}

	public List<String> getSecondaryMuscles() {
		return secondaryMuscles;
	}

	public void setSecondaryMuscles(List<String> secondaryMuscles) {
		this.secondaryMuscles = secondaryMuscles;
	}

	public List<String> getInstructions() {
		return instructions;
	}

	public void setInstructions(List<String> instructions) {
		this.instructions = instructions;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}
}